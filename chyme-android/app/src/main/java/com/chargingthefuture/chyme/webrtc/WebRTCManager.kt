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

/**
 * WebRTCManager connects the local WebRTC audio track with the Chyme signaling channel.
 *
 * This implementation supports a single remote peer in a room. It is intended as a
 * concrete, working baseline to prove end-to-end audio, not a full mesh/SFU solution.
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

    private var peerConnection: PeerConnection? = null
    
    private val _connectionState = MutableStateFlow<com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState>(
        com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
    )
    val connectionState: StateFlow<com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState> = _connectionState.asStateFlow()
    
    private val _connectionError = MutableStateFlow<String?>(null)
    val connectionError: StateFlow<String?> = _connectionError.asStateFlow()

    fun start() {
        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
        _connectionError.value = null
        
        webRtcRepo.initialize()
        val factory = webRtcRepo.getPeerConnectionFactory() ?: run {
            _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
            _connectionError.value = "Failed to initialize WebRTC factory"
            return
        }

        val iceServers = listOf(
            PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer()
        )

        setupPeerConnection(factory, iceServers)
        signalingClient.connect()
        observeSignaling()
        observeConnectionState()

        if (isCaller) {
            createAndSendOffer()
        }
    }

    fun stop() {
        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
        _connectionError.value = null
        signalingClient.dispose()
        peerConnection?.close()
        peerConnection = null
    }

    // --- Internal wiring ---

    private fun setupPeerConnection(
        factory: PeerConnectionFactory,
        iceServers: List<PeerConnection.IceServer>
    ) {
        val rtcConfig = PeerConnection.RTCConfiguration(iceServers)
        peerConnection = factory.createPeerConnection(rtcConfig, object : PeerConnection.Observer {
            override fun onIceCandidate(candidate: IceCandidate) {
                sendIceCandidate(candidate)
            }
            override fun onAddStream(stream: org.webrtc.MediaStream?) {
                // Audio-only: playback is handled automatically by WebRTC audio APIs.
            }
            override fun onConnectionChange(newState: PeerConnection.PeerConnectionState?) {
                when (newState) {
                    PeerConnection.PeerConnectionState.CONNECTED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTED
                        _connectionError.value = null
                    }
                    PeerConnection.PeerConnectionState.DISCONNECTED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
                    }
                    PeerConnection.PeerConnectionState.FAILED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
                        _connectionError.value = "Peer connection failed"
                    }
                    PeerConnection.PeerConnectionState.CONNECTING -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
                    }
                    else -> {}
                }
            }
            override fun onSignalingChange(newState: PeerConnection.SignalingState?) {
                // Track signaling state changes for debugging
            }
            override fun onIceConnectionChange(newState: PeerConnection.IceConnectionState?) {
                when (newState) {
                    PeerConnection.IceConnectionState.CONNECTED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTED
                        _connectionError.value = null
                    }
                    PeerConnection.IceConnectionState.DISCONNECTED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.DISCONNECTED
                    }
                    PeerConnection.IceConnectionState.FAILED -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.FAILED
                        _connectionError.value = "ICE connection failed"
                    }
                    PeerConnection.IceConnectionState.CONNECTING -> {
                        _connectionState.value = com.chargingthefuture.chyme.ui.viewmodel.WebRTCConnectionState.CONNECTING
                    }
                    else -> {}
                }
            }
            override fun onIceGatheringChange(newState: PeerConnection.IceGatheringState?) {}
            override fun onIceCandidatesRemoved(candidates: Array<out IceCandidate>?) {}
            override fun onRemoveStream(stream: org.webrtc.MediaStream?) {}
            override fun onDataChannel(dc: org.webrtc.DataChannel?) {}
            override fun onRenegotiationNeeded() {}
            override fun onTrack(rtpTransceiver: org.webrtc.RtpTransceiver?) {}
        })

        // Attach local audio track
        webRtcRepo.getAudioTrack()?.let { track ->
            peerConnection?.addTrack(track)
        }
    }

    private fun observeSignaling() {
        scope.launch {
            signalingClient.events.collectLatest { raw ->
                val json = runCatching { JSONObject(raw) }.getOrNull() ?: return@collectLatest
                if (json.optString("roomId") != roomId) return@collectLatest

                when (json.optString("type")) {
                    "offer" -> if (!isCaller) handleOffer(json)
                    "answer" -> if (isCaller) handleAnswer(json)
                    "ice-candidate" -> handleRemoteCandidate(json)
                    "chat-message" -> {
                        // Handle chat messages from WebSocket
                        // This will be forwarded to RoomViewModel via callback
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
                        // Signaling connected - WebRTC peer connection may still be connecting
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

    private fun createAndSendOffer() {
        val pc = peerConnection ?: return
        val constraints = org.webrtc.MediaConstraints()
        pc.createOffer(object : SdpObserver {
            override fun onCreateSuccess(desc: SessionDescription) {
                pc.setLocalDescription(this, desc)
                sendSdp("offer", desc)
            }
            override fun onSetSuccess() {}
            override fun onCreateFailure(p0: String?) {}
            override fun onSetFailure(p0: String?) {}
        }, constraints)
    }

    private fun handleOffer(json: JSONObject) {
        val sdp = json.optString("sdp", null) ?: return
        val pc = peerConnection ?: return

        val desc = SessionDescription(SessionDescription.Type.OFFER, sdp)
        pc.setRemoteDescription(object : SdpObserver {
            override fun onSetSuccess() {
                val constraints = org.webrtc.MediaConstraints()
                pc.createAnswer(object : SdpObserver {
                    override fun onCreateSuccess(ans: SessionDescription) {
                        pc.setLocalDescription(this, ans)
                        sendSdp("answer", ans)
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

    private fun handleAnswer(json: JSONObject) {
        val sdp = json.optString("sdp", null) ?: return
        val pc = peerConnection ?: return
        val desc = SessionDescription(SessionDescription.Type.ANSWER, sdp)
        pc.setRemoteDescription(object : SdpObserver {
            override fun onSetSuccess() {}
            override fun onCreateSuccess(p0: SessionDescription?) {}
            override fun onCreateFailure(p0: String?) {}
            override fun onSetFailure(p0: String?) {}
        }, desc)
    }

    private fun handleRemoteCandidate(json: JSONObject) {
        val candidate = json.optJSONObject("candidate") ?: return
        val sdpMid = candidate.optString("sdpMid", null) ?: return
        val sdpMLineIndex = candidate.optInt("sdpMLineIndex", -1)
        val sdp = candidate.optString("candidate", null) ?: return

        val ice = IceCandidate(sdpMid, sdpMLineIndex, sdp)
        peerConnection?.addIceCandidate(ice)
    }

    private fun sendSdp(type: String, desc: SessionDescription) {
        val json = JSONObject()
            .put("type", type)
            .put("roomId", roomId)
            .put("from", currentUserId)
            .put("sdp", desc.description)

        signalingClient.send(json.toString())
    }

    private fun sendIceCandidate(candidate: IceCandidate) {
        val candJson = JSONObject()
            .put("sdpMid", candidate.sdpMid)
            .put("sdpMLineIndex", candidate.sdpMLineIndex)
            .put("candidate", candidate.sdp)

        val json = JSONObject()
            .put("type", "ice-candidate")
            .put("roomId", roomId)
            .put("from", currentUserId)
            .put("candidate", candJson)

        signalingClient.send(json.toString())
    }
}


