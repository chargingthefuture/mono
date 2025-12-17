package com.roshadgu.treehouse.data.api

import com.roshadgu.treehouse.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ChymeApiService {
    
    // Authentication endpoints
    @POST("/api/chyme/validate-mobile-code")
    suspend fun validateMobileCode(@Body request: ValidateMobileCodeRequest): Response<ValidateMobileCodeResponse>
    
    @POST("/api/chyme/validate-otp")
    suspend fun validateOTP(@Body request: ValidateOTPRequest): Response<ValidateOTPResponse>
    
    // Room endpoints
    @GET("/api/chyme/rooms")
    suspend fun getRooms(
        @Query("roomType") roomType: String? = null
    ): Response<List<ChymeRoom>>
    
    @GET("/api/chyme/rooms/{id}")
    suspend fun getRoom(@Path("id") roomId: String): Response<ChymeRoom>
    
    @POST("/api/chyme/rooms/{roomId}/join")
    suspend fun joinRoom(@Path("roomId") roomId: String): Response<ApiError>
    
    @POST("/api/chyme/rooms/{roomId}/leave")
    suspend fun leaveRoom(@Path("roomId") roomId: String): Response<ApiError>
    
    @GET("/api/chyme/rooms/{roomId}/participants")
    suspend fun getRoomParticipants(@Path("roomId") roomId: String): Response<List<ChymeRoomParticipant>>
    
    @GET("/api/chyme/rooms/{roomId}/messages")
    suspend fun getRoomMessages(@Path("roomId") roomId: String): Response<List<ChymeMessage>>
}

