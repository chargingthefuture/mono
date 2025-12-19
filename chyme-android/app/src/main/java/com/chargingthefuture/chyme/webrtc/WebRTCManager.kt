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
    private val iceServers = listOf(
        PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer()
    )
    
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
                // Audio-only: playback is handled automatically by WebRTC audio APIs.
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
                    PeerConnection.IceConnectionState.CONNECTING -> {
                        peerConnectionStates[userId] = PeerConnection.PeerConnectionState.CONNECTING
                    }
                    else -> {}
                }
                updateOverallConnectionState()
            }
            override fun onIceGatheringChange(newState: PeerConnection.IceGatheringState?) {}
            override fun onIceCandidatesRemoved(candidates: Array<out IceCandidate>?) {}
            override fun onRemoveStream(stream: org.webrtc.MediaStream?) {}
            override fun onDataChannel(dc: org.webrtc.DataChannel?) {}
            override fun onRenegotiationNeeded() {}
            override fun onTrack(rtpTransceiver: org.webrtc.RtpTransceiver?) {
                // Handle remote audio track
            }
        })

        // Attach local audio track
        webRtcRepo.getAudioTrack()?.let { track ->
            pc.addTrack(track)
        }
        
        return pc
    }
    
    private fun updateOverallConnectionState() {
        val states = peerConnectionStates.values
        when {
            states.isEmpty() -> {
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
            }
            states.any { it == PeerConnection.PeerConnectionState.CONNECTED } -> {
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTED
                _connectionError.value = null
            }
            states.any { it == PeerConnection.PeerConnectionState.FAILED } -> {
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
                _connectionError.value = "Some peer connections failed"
            }
            states.any { it == PeerConnection.PeerConnectionState.CONNECTING } -> {
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
            }
            else -> {
                _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
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
        val sdp = json.optString("sdp", null) ?: return
        
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
        val sdp = json.optString("sdp", null) ?: return
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
        val sdpMid = candidate.optString("sdpMid", null) ?: return
        val sdpMLineIndex = candidate.optInt("sdpMLineIndex", -1)
        val sdp = candidate.optString("candidate", null) ?: return

        val ice = IceCandidate(sdpMid, sdpMLineIndex, sdp)
        peerConnections[fromUserId]?.addIceCandidate(ice)
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
