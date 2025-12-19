package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class ChymeRoom(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: String?,
    @SerializedName("roomType")
    val roomType: String, // "public" or "private"
    @SerializedName("isActive")
    val isActive: Boolean,
    @SerializedName("maxParticipants")
    val maxParticipants: Int?,
    @SerializedName("createdBy")
    val createdBy: String,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("updatedAt")
    val updatedAt: String,
    @SerializedName("currentParticipants")
    val currentParticipants: Int = 0,
    @SerializedName("topic")
    val topic: String? = null,
    @SerializedName("pinnedLink")
    val pinnedLink: String? = null,
    @SerializedName("creator")
    val creator: ChymeUser? = null
)

