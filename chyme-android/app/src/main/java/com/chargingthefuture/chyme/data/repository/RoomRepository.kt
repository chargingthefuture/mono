package com.chargingthefuture.chyme.data.repository

import com.chargingthefuture.chyme.data.api.ApiClient
import com.chargingthefuture.chyme.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

class RoomRepository {
    private val apiService = ApiClient.apiService
    
    suspend fun getRooms(roomType: String? = null, topic: String? = null): Result<List<ChymeRoom>> {
        return try {
            val response = apiService.getRooms(roomType, topic)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to load rooms: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getRoom(roomId: String): Result<ChymeRoom> {
        return try {
            val response = apiService.getRoom(roomId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to load room: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createRoom(request: CreateRoomRequest): Result<ChymeRoom> {
        return try {
            val response = apiService.createRoom(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create room: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun joinRoom(roomId: String): Result<Unit> {
        return try {
            val response = apiService.joinRoom(roomId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to join room: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun leaveRoom(roomId: String): Result<Unit> {
        return try {
            val response = apiService.leaveRoom(roomId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to leave room: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getRoomParticipants(roomId: String): Result<List<ChymeRoomParticipant>> {
        return try {
            val response = apiService.getRoomParticipants(roomId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to load participants: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun raiseHand(roomId: String): Result<Unit> {
        return try {
            val response = apiService.raiseHand(roomId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to raise hand: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateParticipant(
        roomId: String,
        userId: String,
        request: UpdateParticipantRequest
    ): Result<Unit> {
        return try {
            val response = apiService.updateParticipant(roomId, userId, request)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to update participant: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun kickParticipant(roomId: String, userId: String): Result<Unit> {
        return try {
            val response = apiService.kickParticipant(roomId, userId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to kick participant: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}


