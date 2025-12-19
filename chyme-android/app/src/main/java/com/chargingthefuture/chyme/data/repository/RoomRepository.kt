package com.chargingthefuture.chyme.data.repository

import com.chargingthefuture.chyme.data.api.ApiClient
import com.chargingthefuture.chyme.data.model.*
import kotlinx.coroutines.delay
import javax.inject.Inject
import javax.inject.Singleton

class RoomRepository {
    private val apiService = ApiClient.apiService

    private suspend fun <T> withRetry(
        maxAttempts: Int = 2,
        initialDelayMs: Long = 500,
        block: suspend () -> Result<T>
    ): Result<T> {
        var attempt = 0
        var delayMs = initialDelayMs
        var lastError: Throwable? = null

        while (attempt < maxAttempts) {
            val result = block()
            result.fold(
                onSuccess = { return result },
                onFailure = { error ->
                    lastError = error
                    attempt++
                    if (attempt < maxAttempts) {
                        delay(delayMs)
                        delayMs *= 2
                    }
                }
            )
            if (attempt >= maxAttempts) break
        }
        return Result.failure(lastError ?: Exception("Unknown error"))
    }
    
    suspend fun getRooms(roomType: String? = null, topic: String? = null): Result<List<ChymeRoom>> =
        withRetry {
            try {
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
    
    suspend fun getRoom(roomId: String): Result<ChymeRoom> =
        withRetry {
            try {
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
    
    suspend fun endRoom(roomId: String): Result<Unit> {
        return try {
            val response = apiService.endRoom(roomId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to end room: ${response.message()}"))
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
    
    suspend fun getRoomParticipants(roomId: String): Result<List<ChymeRoomParticipant>> =
        withRetry {
            try {
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

    suspend fun getRoomMessages(roomId: String): Result<List<ChymeMessage>> =
        withRetry {
            try {
                val response = apiService.getRoomMessages(roomId)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Failed to load messages: ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun sendMessage(roomId: String, content: String, isAnonymous: Boolean = true): Result<ChymeMessage> {
        return try {
            val request = SendMessageRequest(content = content, isAnonymous = isAnonymous)
            val response = apiService.sendRoomMessage(roomId, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to send message: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updatePinnedLink(roomId: String, pinnedLink: String?): Result<ChymeRoom> {
        return try {
            val response = apiService.updatePinnedLink(
                roomId,
                UpdatePinnedLinkRequest(pinnedLink = pinnedLink)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update pinned link: ${response.message()}"))
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


