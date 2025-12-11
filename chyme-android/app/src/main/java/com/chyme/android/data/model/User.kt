package com.chyme.android.data.model

data class User(
    val id: String,
    val email: String?,
    val firstName: String?,
    val lastName: String?,
    val profileImageUrl: String?,
    val quoraProfileUrl: String?,
    val isAdmin: Boolean,
    val isVerified: Boolean,
    val isApproved: Boolean
)

