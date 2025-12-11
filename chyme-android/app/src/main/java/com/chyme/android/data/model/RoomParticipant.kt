package com.chyme.android.data.model

data class RoomParticipant(
    val id: String,
    val roomId: String,
    val userId: String,
    val isMuted: Boolean,
    val isSpeaking: Boolean,
    val joinedAt: String,
    val leftAt: String?
)

