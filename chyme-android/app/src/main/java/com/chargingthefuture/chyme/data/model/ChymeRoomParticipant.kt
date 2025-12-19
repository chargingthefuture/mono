package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class ChymeRoomParticipant(
    @SerializedName("id")
    val id: String,
    @SerializedName("roomId")
    val roomId: String,
    @SerializedName("userId")
    val userId: String,
    @SerializedName("isMuted")
    val isMuted: Boolean,
    @SerializedName("isSpeaking")
    val isSpeaking: Boolean,
    @SerializedName("joinedAt")
    val joinedAt: String,
    @SerializedName("leftAt")
    val leftAt: String?,
    @SerializedName("user")
    val user: ChymeUser? = null,
    @SerializedName("role")
    val role: ParticipantRole = ParticipantRole.LISTENER,
    @SerializedName("hasRaisedHand")
    val hasRaisedHand: Boolean = false
)

enum class ParticipantRole {
    @SerializedName("creator")
    CREATOR,
    @SerializedName("speaker")
    SPEAKER,
    @SerializedName("listener")
    LISTENER
}

data class ChymeUser(
    @SerializedName("id")
    val id: String,
    @SerializedName("email")
    val email: String?,
    @SerializedName("firstName")
    val firstName: String?,
    @SerializedName("lastName")
    val lastName: String?,
    @SerializedName("profileImageUrl")
    val profileImageUrl: String?,
    @SerializedName("displayName")
    val displayName: String? = null,
    @SerializedName("username")
    val username: String? = null
)

