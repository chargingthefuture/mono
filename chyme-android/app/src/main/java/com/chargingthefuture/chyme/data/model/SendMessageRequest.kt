package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class SendMessageRequest(
    @SerializedName("content")
    val content: String,
    @SerializedName("isAnonymous")
    val isAnonymous: Boolean = true
)


