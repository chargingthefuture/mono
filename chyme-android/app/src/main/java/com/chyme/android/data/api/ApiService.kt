package com.chyme.android.data.api

import com.chyme.android.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth endpoints
    @GET("/api/auth/user")
    suspend fun getCurrentUser(): Response<User>
    
    @PUT("/api/user/quora-profile-url")
    suspend fun updateQuoraProfileUrl(
        @Body request: Map<String, String?>
    ): Response<User>
    
    // Room endpoints
    @GET("/api/chyme/rooms")
    suspend fun getRooms(
        @Query("roomType") roomType: String? = null
    ): Response<List<Room>>
    
    @GET("/api/chyme/rooms/{id}")
    suspend fun getRoom(@Path("id") id: String): Response<Room>
    
    @POST("/api/chyme/admin/rooms")
    suspend fun createRoom(@Body request: CreateRoomRequest): Response<Room>
    
    // Message endpoints
    @GET("/api/chyme/rooms/{roomId}/messages")
    suspend fun getMessages(@Path("roomId") roomId: String): Response<List<Message>>
    
    @POST("/api/chyme/rooms/{roomId}/messages")
    suspend fun sendMessage(
        @Path("roomId") roomId: String,
        @Body request: SendMessageRequest
    ): Response<Message>
    
    // Participant endpoints
    @POST("/api/chyme/rooms/{roomId}/join")
    suspend fun joinRoom(@Path("roomId") roomId: String): Response<Map<String, String>>
    
    @POST("/api/chyme/rooms/{roomId}/leave")
    suspend fun leaveRoom(@Path("roomId") roomId: String): Response<Map<String, String>>
    
    @GET("/api/chyme/rooms/{roomId}/participants")
    suspend fun getParticipants(@Path("roomId") roomId: String): Response<List<RoomParticipant>>
}

