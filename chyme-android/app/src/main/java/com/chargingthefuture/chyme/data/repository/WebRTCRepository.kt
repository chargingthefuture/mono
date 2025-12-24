package com.chargingthefuture.chyme.data.repository

import android.content.Context
import org.webrtc.AudioSource
import org.webrtc.AudioTrack
import org.webrtc.MediaConstraints
import org.webrtc.PeerConnectionFactory

/**
 * WebRTC Repository for audio streaming (local microphone control only).
 *
 * This implementation creates a single local audio track and lets the
 * rest of the app toggle its enabled state. It does NOT handle signaling
 * or remote peers – that must be added separately.
 */
class WebRTCRepository(
    private val context: Context
) {
    private var isInitialized = false
    private var isMuted = false

    private var peerConnectionFactory: PeerConnectionFactory? = null
    private var audioSource: AudioSource? = null
    private var audioTrack: AudioTrack? = null

    fun initialize() {
        if (isInitialized) return

        try {
            // Initialize WebRTC global state (safe to call once per process)
            val initializationOptions = PeerConnectionFactory.InitializationOptions
                .builder(context)
                .setEnableInternalTracer(true)
                .createInitializationOptions()
            PeerConnectionFactory.initialize(initializationOptions)

            val options = PeerConnectionFactory.Options()
            
            // Use the builder pattern (requires org.webrtc.Environment)
            // com.infobip:google-webrtc includes the Environment class
            peerConnectionFactory = PeerConnectionFactory.builder()
                .setOptions(options)
                .createPeerConnectionFactory()

            val constraints = MediaConstraints()
            audioSource = peerConnectionFactory?.createAudioSource(constraints)
            audioTrack = peerConnectionFactory?.createAudioTrack("audio_track", audioSource)

            // Start with mic enabled; ViewModel will call muteMicrophone() as needed.
            audioTrack?.setEnabled(true)
            isMuted = false
            isInitialized = true
        } catch (e: Exception) {
            // Log error and rethrow to let the caller handle it
            throw RuntimeException("Failed to initialize WebRTC: ${e.message}", e)
        }
    }

    fun getAudioTrack(): AudioTrack? = audioTrack

    fun getPeerConnectionFactory(): PeerConnectionFactory? = peerConnectionFactory

    fun muteMicrophone(muted: Boolean) {
        isMuted = muted
        audioTrack?.setEnabled(!muted)
    }

    fun isMicrophoneMuted(): Boolean {
        return isMuted
    }

    fun cleanup() {
        audioTrack?.dispose()
        audioSource?.dispose()
        peerConnectionFactory?.dispose()

        audioTrack = null
        audioSource = null
        peerConnectionFactory = null
        isInitialized = false
    }
}

