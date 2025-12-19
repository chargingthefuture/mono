package com.chargingthefuture.chyme.data.model

import com.google.gson.annotations.SerializedName

data class OTPResponse(
    @SerializedName("otp")
    val otp: String,
    @SerializedName("expiresAt")
    val expiresAt: String,
    @SerializedName("message")
    val message: String
)

data class ValidateOTPRequest(
    @SerializedName("otp")
    val otp: String
)

data class ValidateOTPResponse(
    @SerializedName("token")
    val token: String,
    @SerializedName("expiresAt")
    val expiresAt: String,
    @SerializedName("user")
    val user: ChymeUser
)

data class ValidateMobileCodeRequest(
    @SerializedName("code")
    val code: String
)

data class ValidateMobileCodeResponse(
    @SerializedName("token")
    val token: String,
    @SerializedName("expiresAt")
    val expiresAt: String,
    @SerializedName("user")
    val user: ChymeUser
)

data class ApiError(
    @SerializedName("message")
    val message: String
)

