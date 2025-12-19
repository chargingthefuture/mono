package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class FollowStatusResponse(
    @SerializedName("isFollowing")
    val isFollowing: Boolean
)

