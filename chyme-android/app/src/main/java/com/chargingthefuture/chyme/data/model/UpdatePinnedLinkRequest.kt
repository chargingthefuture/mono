package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class UpdatePinnedLinkRequest(
    @SerializedName("pinnedLink")
    val pinnedLink: String?
)


