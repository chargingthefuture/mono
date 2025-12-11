package com.chyme.android.data.model

data class Message(
    val id: String,
    val roomId: String,
    val userId: String,
    val content: String,
    val isAnonymous: Boolean,
    val createdAt: String
)

data class SendMessageRequest(
    val content: String,
    val isAnonymous: Boolean = true
)

