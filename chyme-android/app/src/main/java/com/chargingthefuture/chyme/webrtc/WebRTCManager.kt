package com.chargingthefuture.chyme.webrtc

import com.chargingthefuture.chyme.data.repository.WebRTCRepository
import com.chargingthefuture.chyme.signaling.SignalingClient
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
        endpointUrl = signalingEndpoint,
        scope = scope
    )

    private var peerConnection: PeerConnection? = null

    fun start() {
        webRtcRepo.initialize()
        val factory = webRtcRepo.getPeerConnectionFactory() ?: return

        val iceServers = listOf(
            PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer()
        )

        setupPeerConnection(factory, iceServers)
        signalingClient.connect()
        observeSignaling()

        if (isCaller) {
            createAndSendOffer()
        }
    }

    fun stop() {
        signalingClient.close()
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
            override fun onConnectionChange(newState: PeerConnection.PeerConnectionState?) {}
            override fun onSignalingChange(newState: PeerConnection.SignalingState?) {}
            override fun onIceConnectionChange(newState: PeerConnection.IceConnectionState?) {}
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


