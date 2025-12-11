package com.chyme.android.data.model

data class Room(
    val id: String,
    val name: String,
    val description: String?,
    val roomType: String, // "private" or "public"
    val isActive: Boolean,
    val maxParticipants: Int?,
    val currentParticipants: Int?,
    val createdBy: String,
    val createdAt: String,
    val updatedAt: String
)

data class CreateRoomRequest(
    val name: String,
    val description: String?,
    val roomType: String,
    val maxParticipants: Int?
)

