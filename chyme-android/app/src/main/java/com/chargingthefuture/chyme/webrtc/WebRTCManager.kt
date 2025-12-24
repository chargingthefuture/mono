package com.chargingthefuture.chyme.webrtc

import com.chargingthefuture.chyme.data.repository.WebRTCRepository
import com.chargingthefuture.chyme.signaling.SignalingClient
import com.chargingthefuture.chyme.signaling.SignalingConnectionState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import org.json.JSONObject
import org.webrtc.IceCandidate
import org.webrtc.PeerConnection
import org.webrtc.PeerConnectionFactory
import org.webrtc.SdpObserver
import org.webrtc.SessionDescription
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.ConcurrentHashMap

/**
 * WebRTCManager connects the local WebRTC audio track with the Chyme signaling channel.
 *
 * This implementation supports multiple remote peers in a room using a mesh architecture.
 * Each speaker gets their own PeerConnection, and the manager handles offers/answers
 * and ICE candidates for all peers.
 */
class WebRTCManager(
    private val roomId: String,
    private val currentUserId: String,
    private val webRtcRepo: WebRTCRepository,
    signalingEndpoint: String,
    authToken: String,
    private val isCaller: Boolean
) {
    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private val signalingClient = SignalingClient(
        roomId = roomId,
        authToken = authToken,
        userId = currentUserId,
        endpointUrl = signalingEndpoint,
        scope = scope
    )

    // Map of userId -> PeerConnection for all active peer connections
    private val peerConnections = ConcurrentHashMap<String, PeerConnection>()
    private var peerConnectionFactory: PeerConnectionFactory? = null
    
    // ICE servers: STUN for discovery, TURN for NAT traversal
    // Note: TURN servers should be configured with actual credentials in production
    // For now, using public STUN and placeholder TURN configuration
    private val iceServers = buildList {
        // Public STUN server for NAT discovery
        add(PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer())
        
        // TURN servers for NAT traversal (required for many mobile/corporate networks)
        // TODO: Replace with actual TURN server credentials in production
        // Example TURN server configuration (uncomment and configure):
        // add(PeerConnection.IceServer.builder("turn:your-turn-server.com:3478")
        //     .setUsername("username")
        //     .setPassword("password")
        //     .createIceServer())
        
        // Fallback: Try using STUN as TURN (may work in some cases)
        // This is not ideal but better than nothing
        add(PeerConnection.IceServer.builder("stun:stun1.l.google.com:19302").createIceServer())
        add(PeerConnection.IceServer.builder("stun:stun2.l.google.com:19302").createIceServer())
    }
    
    // Track remote audio tracks per peer for proper cleanup
    private val remoteAudioTracks = ConcurrentHashMap<String, org.webrtc.AudioTrack>()
    
    // Track which peers we've sent offers to (to avoid duplicate offers)
    private val pendingOffers = mutableSetOf<String>()
    
    private val _connectionState = MutableStateFlow<com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState>(
        com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
    )
    val connectionState: StateFlow<com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState> = _connectionState.asStateFlow()
    
    private val _connectionError = MutableStateFlow<String?>(null)
    val connectionError: StateFlow<String?> = _connectionError.asStateFlow()
    
    // Track per-peer connection states
    private val peerConnectionStates = ConcurrentHashMap<String, PeerConnection.PeerConnectionState>()

    fun start() {
        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
        _connectionError.value = null
        
        webRtcRepo.initialize()
        peerConnectionFactory = webRtcRepo.getPeerConnectionFactory() ?: run {
            _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
            _connectionError.value = "Failed to initialize WebRTC factory"
            return
        }

        signalingClient.connect()
        observeSignaling()
        observeConnectionState()
    }
    
    /**
     * Add or update a peer connection for a specific user.
     * This is called when a new speaker joins or when we need to establish connection with existing speakers.
     */
    fun addPeer(userId: String) {
        if (userId == currentUserId) return // Don't create connection to self
        if (peerConnections.containsKey(userId)) return // Already have connection
        
        val factory = peerConnectionFactory ?: return
        val pc = createPeerConnection(factory, userId)
        peerConnections[userId] = pc
        
        // If we're a caller (speaker), send an offer to this new peer
        if (isCaller && !pendingOffers.contains(userId)) {
            pendingOffers.add(userId)
            createAndSendOffer(userId, pc)
        }
    }
    
    /**
     * Remove a peer connection when a user leaves or is no longer a speaker.
     */
    fun removePeer(userId: String) {
        // Disable and cleanup remote audio track
        remoteAudioTracks[userId]?.setEnabled(false)
        remoteAudioTracks.remove(userId)
        
        // Close peer connection
        peerConnections[userId]?.close()
        peerConnections.remove(userId)
        pendingOffers.remove(userId)
        peerConnectionStates.remove(userId)
        updateOverallConnectionState()
    }
    
    /**
     * Update peer list based on current speakers in the room.
     * This should be called when participants list changes.
     */
    fun updatePeers(speakerUserIds: List<String>) {
        val currentPeerIds = peerConnections.keys.toSet()
        val targetPeerIds = speakerUserIds.filter { it != currentUserId }.toSet()
        
        // Remove peers that are no longer speakers
        currentPeerIds.filter { it !in targetPeerIds }.forEach { userId ->
            removePeer(userId)
        }
        
        // Add new peers that are speakers
        targetPeerIds.filter { it !in currentPeerIds }.forEach { userId ->
            addPeer(userId)
        }
    }

    fun stop() {
        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
        _connectionError.value = null
        signalingClient.dispose()
        
        // Disable and cleanup all remote audio tracks
        remoteAudioTracks.values.forEach { it.setEnabled(false) }
        remoteAudioTracks.clear()
        
        // Close all peer connections
        peerConnections.values.forEach { it.close() }
        peerConnections.clear()
        pendingOffers.clear()
        peerConnectionStates.clear()
    }

    // --- Internal wiring ---

    private fun createPeerConnection(
        factory: PeerConnectionFactory,
        userId: String
    ): PeerConnection {
        val rtcConfig = PeerConnection.RTCConfiguration(iceServers)
        val pc = factory.createPeerConnection(rtcConfig, object : PeerConnection.Observer {
            override fun onIceCandidate(candidate: IceCandidate) {
                sendIceCandidate(candidate, userId)
            }
            override fun onAddStream(stream: org.webrtc.MediaStream?) {
                // Legacy callback - modern WebRTC uses onTrack instead
                // Handle audio tracks from legacy streams
                stream?.audioTracks?.forEach { track ->
                    track.setEnabled(true)
                    remoteAudioTracks[userId] = track
                }
            }
            override fun onConnectionChange(newState: PeerConnection.PeerConnectionState?) {
                peerConnectionStates[userId] = newState ?: PeerConnection.PeerConnectionState.NEW
                updateOverallConnectionState()
            }
            override fun onSignalingChange(newState: PeerConnection.SignalingState?) {
                // Track signaling state changes for debugging
            }
            override fun onIceConnectionChange(newState: PeerConnection.IceConnectionState?) {
                // Update connection state based on ICE
                when (newState) {
                    PeerConnection.IceConnectionState.CONNECTED -> {
                        peerConnectionStates[userId] = PeerConnection.PeerConnectionState.CONNECTED
                    }
                    PeerConnection.IceConnectionState.DISCONNECTED -> {
                        peerConnectionStates[userId] = PeerConnection.PeerConnectionState.DISCONNECTED
                    }
                    PeerConnection.IceConnectionState.FAILED -> {
                        peerConnectionStates[userId] = PeerConnection.PeerConnectionState.FAILED
                    }
                    PeerConnection.IceConnectionState.CHECKING -> {
                        peerConnectionStates[userId] = PeerConnection.PeerConnectionState.CONNECTING
                    }
                    else -> {}
                }
                updateOverallConnectionState()
            }
            override fun onIceConnectionReceivingChange(receiving: Boolean) {
                // Track ICE connection receiving state changes
            }
            override fun onIceGatheringChange(newState: PeerConnection.IceGatheringState?) {}
            override fun onIceCandidatesRemoved(candidates: Array<out IceCandidate>?) {}
            override fun onRemoveStream(stream: org.webrtc.MediaStream?) {
                // Clean up remote audio tracks when stream is removed
                stream?.audioTracks?.forEach { track ->
                    track.setEnabled(false)
                    remoteAudioTracks.remove(userId)
                }
            }
            override fun onDataChannel(dc: org.webrtc.DataChannel?) {}
            override fun onRenegotiationNeeded() {}
            override fun onTrack(rtpTransceiver: org.webrtc.RtpTransceiver?) {
                // Handle remote audio track from peer
                rtpTransceiver?.receiver?.track()?.let { track ->
                    if (track is org.webrtc.AudioTrack) {
                        // Enable the remote audio track for playback
                        track.setEnabled(true)
                        // Store reference for cleanup
                        remoteAudioTracks[userId] = track
                        // WebRTC Android automatically routes enabled audio tracks to the speaker
                        // No additional audio renderer setup needed for basic audio playback
                    }
                }
            }
        })

        // Attach local audio track
        webRtcRepo.getAudioTrack()?.let { track ->
            pc?.addTrack(track)
        }
        
        return pc ?: throw IllegalStateException("Failed to create PeerConnection")
    }
    
    private fun updateOverallConnectionState() {
        val states = peerConnectionStates.values
        val connectedCount = states.count { it == PeerConnection.PeerConnectionState.CONNECTED }
        val failedCount = states.count { it == PeerConnection.PeerConnectionState.FAILED }
        val connectingCount = states.count { it == PeerConnection.PeerConnectionState.CONNECTING }
        val totalCount = states.size
        
        when {
            states.isEmpty() -> {
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
                _connectionError.value = null
            }
            connectedCount > 0 -> {
                // At least one peer is connected - we're in a good state
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTED
                // Only show error if some peers failed and we have multiple peers
                if (failedCount > 0 && totalCount > 1) {
                    _connectionError.value = "$failedCount of $totalCount peer connections failed"
                } else {
                    _connectionError.value = null
                }
            }
            failedCount == totalCount && totalCount > 0 -> {
                // All peers failed
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
                _connectionError.value = "All peer connections failed"
            }
            connectingCount > 0 -> {
                // Some peers are still connecting
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
                _connectionError.value = null
            }
            else -> {
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
                _connectionError.value = null
            }
        }
    }

    private fun observeSignaling() {
        scope.launch {
            signalingClient.events.collectLatest { raw ->
                val json = runCatching { JSONObject(raw) }.getOrNull() ?: return@collectLatest
                if (json.optString("roomId") != roomId) return@collectLatest
                
                val fromUserId = json.optString("fromUserId") ?: json.optString("from", "")
                if (fromUserId == currentUserId) return@collectLatest // Ignore our own messages

                when (json.optString("type")) {
                    "offer" -> if (!isCaller) handleOffer(json, fromUserId)
                    "answer" -> if (isCaller) handleAnswer(json, fromUserId)
                    "ice-candidate" -> handleRemoteCandidate(json, fromUserId)
                    "chat-message" -> {
                        // Handle chat messages from WebSocket
                        onChatMessageReceived?.invoke(json)
                    }
                }
            }
        }
    }
    
    // Callback for chat messages (set by RoomViewModel)
    var onChatMessageReceived: ((JSONObject) -> Unit)? = null

    private fun observeConnectionState() {
        scope.launch {
            signalingClient.connectionState.collectLatest { state ->
                when (state) {
                    SignalingConnectionState.CONNECTED -> {
                        // Signaling connected - WebRTC peer connections may still be connecting
                        if (_connectionState.value == com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED) {
                            _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
                        }
                    }
                    SignalingConnectionState.CONNECTING -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
                    }
                    SignalingConnectionState.RECONNECTING -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.RECONNECTING
                    }
                    SignalingConnectionState.FAILED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
                    }
                    SignalingConnectionState.DISCONNECTED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
                    }
                }
            }
        }
        
        // Also observe errors for additional handling
        scope.launch {
            signalingClient.errors.collectLatest { error ->
                _connectionError.value = error.message
                if (_connectionState.value != com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED) {
                    _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
                }
            }
        }
    }

    private fun createAndSendOffer(userId: String, pc: PeerConnection) {
        val constraints = org.webrtc.MediaConstraints()
        pc.createOffer(object : SdpObserver {
            override fun onCreateSuccess(desc: SessionDescription) {
                pc.setLocalDescription(this, desc)
                sendSdp("offer", desc, userId)
            }
            override fun onSetSuccess() {}
            override fun onCreateFailure(p0: String?) {
                pendingOffers.remove(userId)
            }
            override fun onSetFailure(p0: String?) {
                pendingOffers.remove(userId)
            }
        }, constraints)
    }

    private fun handleOffer(json: JSONObject, fromUserId: String) {
        val sdp = json.optString("sdp").takeIf { it.isNotEmpty() } ?: return
        
        // Get or create peer connection for this user
        val pc = peerConnections[fromUserId] ?: run {
            val factory = peerConnectionFactory ?: return
            val newPc = createPeerConnection(factory, fromUserId)
            peerConnections[fromUserId] = newPc
            newPc
        }

        val desc = SessionDescription(SessionDescription.Type.OFFER, sdp)
        pc.setRemoteDescription(object : SdpObserver {
            override fun onSetSuccess() {
                val constraints = org.webrtc.MediaConstraints()
                pc.createAnswer(object : SdpObserver {
                    override fun onCreateSuccess(ans: SessionDescription) {
                        pc.setLocalDescription(this, ans)
                        sendSdp("answer", ans, fromUserId)
                    }
                    override fun onSetSuccess() {}
                    override fun onCreateFailure(p0: String?) {}
                    override fun onSetFailure(p0: String?) {}
                }, constraints)
            }
            override fun onCreateSuccess(p0: SessionDescription?) {}
            override fun onCreateFailure(p0: String?) {}
            override fun onSetFailure(p0: String?) {}
        }, desc)
    }

    private fun handleAnswer(json: JSONObject, fromUserId: String) {
        val sdp = json.optString("sdp").takeIf { it.isNotEmpty() } ?: return
        val pc = peerConnections[fromUserId] ?: return
        val desc = SessionDescription(SessionDescription.Type.ANSWER, sdp)
        pc.setRemoteDescription(object : SdpObserver {
            override fun onSetSuccess() {}
            override fun onCreateSuccess(p0: SessionDescription?) {}
            override fun onCreateFailure(p0: String?) {}
            override fun onSetFailure(p0: String?) {}
        }, desc)
        pendingOffers.remove(fromUserId)
    }

    private fun handleRemoteCandidate(json: JSONObject, fromUserId: String) {
        val candidate = json.optJSONObject("candidate") ?: return
        val sdpMid = candidate.optString("sdpMid").takeIf { it.isNotEmpty() } ?: return
        val sdpMLineIndex = candidate.optInt("sdpMLineIndex", -1)
        val sdp = candidate.optString("candidate").takeIf { it.isNotEmpty() } ?: return

        val ice = IceCandidate(sdpMid, sdpMLineIndex, sdp)
        peerConnections[fromUserId]?.addIceCandidate(ice) ?: run {
            // Peer connection not found, ignore candidate
        }
    }

    private fun sendSdp(type: String, desc: SessionDescription, toUserId: String) {
        val json = JSONObject()
            .put("type", type)
            .put("roomId", roomId)
            .put("from", currentUserId)
            .put("fromUserId", currentUserId)
            .put("toUserId", toUserId)
            .put("sdp", desc.description)

        signalingClient.send(json.toString())
    }

    private fun sendIceCandidate(candidate: IceCandidate, toUserId: String) {
        val candJson = JSONObject()
            .put("sdpMid", candidate.sdpMid)
            .put("sdpMLineIndex", candidate.sdpMLineIndex)
            .put("candidate", candidate.sdp)

        val json = JSONObject()
            .put("type", "ice-candidate")
            .put("roomId", roomId)
            .put("from", currentUserId)
            .put("fromUserId", currentUserId)
            .put("toUserId", toUserId)
            .put("candidate", candJson)

        signalingClient.send(json.toString())
    }
}
