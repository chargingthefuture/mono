package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class BlockStatusResponse(
    @SerializedName("isBlocked")
    val isBlocked: Boolean
)

