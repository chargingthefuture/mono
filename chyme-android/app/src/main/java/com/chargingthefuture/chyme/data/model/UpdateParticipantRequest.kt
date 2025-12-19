package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class UpdateParticipantRequest(
    @SerializedName("userId")
    val userId: String,
    @SerializedName("role")
    val role: String? = null, // "speaker" or "listener"
    @SerializedName("isMuted")
    val isMuted: Boolean? = null
)


