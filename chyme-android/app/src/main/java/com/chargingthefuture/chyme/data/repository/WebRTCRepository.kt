package com.chargingthefuture.chyme.data.repository

import android.content.Context
import android.util.Log
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
            
            // Check if org.webrtc.Environment class exists using reflection
            // This class is required by PeerConnectionFactory.builder() in newer WebRTC versions
            val environmentClassExists = try {
                Class.forName("org.webrtc.Environment")
                true
            } catch (e: ClassNotFoundException) {
                false
            }
            
            peerConnectionFactory = if (environmentClassExists) {
                // Use the builder pattern (requires org.webrtc.Environment)
                // This is the preferred method for newer WebRTC versions
                try {
                    PeerConnectionFactory.builder()
                        .setOptions(options)
                        .createPeerConnectionFactory()
                } catch (e: Exception) {
                    // If builder fails, try fallback to constructor (for older WebRTC versions)
                    Log.w("WebRTCRepository", "Builder pattern failed, trying constructor fallback: ${e.message}")
                    try {
                        PeerConnectionFactory(options)
                    } catch (e2: Exception) {
                        throw RuntimeException(
                            "Failed to create PeerConnectionFactory with both builder and constructor: ${e2.message}",
                            e2
                        )
                    }
                }
            } else {
                // Environment class is missing - try older constructor API
                // This doesn't require Environment class and works with older WebRTC versions
                Log.w("WebRTCRepository", "Environment class not found, using constructor API")
                try {
                    PeerConnectionFactory(options)
                } catch (e: Exception) {
                    throw RuntimeException(
                        "Failed to create PeerConnectionFactory: Environment class missing and constructor failed. " +
                        "Please ensure com.infobip:google-webrtc is properly included. Error: ${e.message}",
                        e
                    )
                }
            }

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

