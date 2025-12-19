package com.chargingthefuture.chyme.data.api

import com.chargingthefuture.chyme.data.model.*
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
        @Query("roomType") roomType: String? = null,
        @Query("topic") topic: String? = null
    ): Response<List<ChymeRoom>>
    
    @GET("/api/chyme/rooms/{id}")
    suspend fun getRoom(@Path("id") roomId: String): Response<ChymeRoom>
    
    @POST("/api/chyme/rooms")
    suspend fun createRoom(@Body request: CreateRoomRequest): Response<ChymeRoom>
    
    @POST("/api/chyme/rooms/{roomId}/join")
    suspend fun joinRoom(@Path("roomId") roomId: String): Response<ApiError>
    
    @POST("/api/chyme/rooms/{roomId}/leave")
    suspend fun leaveRoom(@Path("roomId") roomId: String): Response<ApiError>
    
    @GET("/api/chyme/rooms/{roomId}/participants")
    suspend fun getRoomParticipants(@Path("roomId") roomId: String): Response<List<ChymeRoomParticipant>>
    
    @POST("/api/chyme/rooms/{roomId}/raise-hand")
    suspend fun raiseHand(@Path("roomId") roomId: String): Response<ApiError>
    
    @PUT("/api/chyme/rooms/{roomId}/participants/{userId}")
    suspend fun updateParticipant(
        @Path("roomId") roomId: String,
        @Path("userId") userId: String,
        @Body request: UpdateParticipantRequest
    ): Response<ApiError>
    
    @DELETE("/api/chyme/rooms/{roomId}/participants/{userId}")
    suspend fun kickParticipant(
        @Path("roomId") roomId: String,
        @Path("userId") userId: String
    ): Response<ApiError>
    
    @GET("/api/chyme/rooms/{roomId}/messages")
    suspend fun getRoomMessages(@Path("roomId") roomId: String): Response<List<ChymeMessage>>
    
    // User endpoints
    @POST("/api/chyme/users/{userId}/follow")
    suspend fun followUser(@Path("userId") userId: String): Response<ApiError>
    
    @DELETE("/api/chyme/users/{userId}/follow")
    suspend fun unfollowUser(@Path("userId") userId: String): Response<ApiError>
    
    @POST("/api/chyme/users/{userId}/block")
    suspend fun blockUser(@Path("userId") userId: String): Response<ApiError>
}

