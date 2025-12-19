package com.chargingthefuture.chyme.data.repository

import android.content.Context
import org.webrtc.*

class WebRTCRepository(
    private val context: Context
) {
    private var peerConnectionFactory: PeerConnectionFactory? = null
    private var audioSource: AudioSource? = null
    private var audioTrack: AudioTrack? = null
    private var isInitialized = false
    
    fun initialize() {
        if (isInitialized) return
        
        val initializationOptions = PeerConnectionFactory.InitializationOptions.builder(context)
            .setEnableInternalTracer(true)
            .createInitializationOptions()
        PeerConnectionFactory.initialize(initializationOptions)
        
        val options = PeerConnectionFactory.Options()
        
        // For audio-only, we don't need video encoder/decoder factories
        peerConnectionFactory = PeerConnectionFactory.builder()
            .setOptions(options)
            .createPeerConnectionFactory()
        
        audioSource = peerConnectionFactory?.createAudioSource(MediaConstraints())
        audioTrack = peerConnectionFactory?.createAudioTrack("audio_track", audioSource)
        
        isInitialized = true
    }
    
    fun getAudioTrack(): AudioTrack? = audioTrack
    
    fun muteMicrophone(muted: Boolean) {
        audioTrack?.setEnabled(!muted)
    }
    
    fun isMicrophoneMuted(): Boolean {
        return audioTrack?.enabled() == false
    }
    
    fun cleanup() {
        audioTrack?.dispose()
        audioSource?.dispose()
        peerConnectionFactory?.dispose()
        isInitialized = false
    }
}


