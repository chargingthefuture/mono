package com.chyme.android.data.model

data class ValidateOTPRequest(
    val otp: String
)

data class ValidateOTPResponse(
    val token: String,
    val user: User
)
