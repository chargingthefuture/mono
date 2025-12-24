package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class ChymeMessage(
    @SerializedName("id")
    val id: String,
    @SerializedName("roomId")
    val roomId: String,
    @SerializedName("userId")
    val userId: String,
    @SerializedName("content")
    val content: String,
    @SerializedName("createdAt")
    val createdAt: String
)

