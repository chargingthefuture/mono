package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class CreateRoomRequest(
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("roomType")
    val roomType: String, // "public" or "private"
    @SerializedName("topic")
    val topic: String? = null,
    @SerializedName("maxParticipants")
    val maxParticipants: Int? = null
)


