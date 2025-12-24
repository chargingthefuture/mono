package com.chargingthefuture.chyme.data.repository

import com.chargingthefuture.chyme.data.api.ApiClient
import com.chargingthefuture.chyme.data.model.*
import kotlinx.coroutines.delay
import javax.inject.Inject
import javax.inject.Singleton

class RoomRepository {
    private val apiService = ApiClient.apiService

    private fun isRetryableError(error: Throwable, responseCode: Int? = null): Boolean {
        // Network exceptions (timeouts, connection errors) are always retryable
        if (error is java.net.SocketTimeoutException ||
            error is java.net.UnknownHostException ||
            error is java.io.IOException ||
            error is javax.net.ssl.SSLException) {
            return true
        }
        
        // HTTP 5xx errors (server errors) are retryable
        if (responseCode != null && responseCode >= 500) {
            return true
        }
        
        // HTTP 429 (Too Many Requests) is retryable
        if (responseCode == 429) {
            return true
        }
        
        // HTTP 4xx errors (client errors) are generally not retryable
        // except for 408 (Request Timeout) and 429 (Too Many Requests)
        if (responseCode != null && responseCode in 400..499) {
            return responseCode == 408 || responseCode == 429
        }
        
        return false
    }
    
    private suspend fun <T> withRetry(
        maxAttempts: Int = 3,
        initialDelayMs: Long = 500,
        block: suspend () -> Result<T>
    ): Result<T> {
        var attempt = 0
        var delayMs = initialDelayMs
        var lastError: Throwable? = null
        var lastResponseCode: Int? = null

        while (attempt < maxAttempts) {
            val result = block()
            result.fold(
                onSuccess = { return result },
                onFailure = { error ->
                    lastError = error
                    attempt++
                    
                    // Extract response code from error message if available
                    val errorMessage = error.message ?: ""
                    val codeMatch = Regex("code: (\\d+)").find(errorMessage)
                    lastResponseCode = codeMatch?.groupValues?.get(1)?.toIntOrNull()
                    
                    // Check if error is retryable
                    val shouldRetry = isRetryableError(error, lastResponseCode)
                    
                    if (shouldRetry && attempt < maxAttempts) {
                        delay(delayMs)
                        delayMs *= 2 // Exponential backoff
                    } else {
                        // Not retryable or max attempts reached
                        return Result.failure(error)
                    }
                }
            )
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
                    val errorMessage = when (response.code()) {
                        404 -> "Room not found"
                        401 -> "Authentication required. Please sign in again."
                        403 -> "You don't have permission to access this room"
                        500, 502, 503, 504 -> "Server error. Please try again."
                        else -> "Failed to load room: ${response.message()}"
                    }
                    Result.failure(Exception("code: ${response.code()}, $errorMessage"))
                }
            } catch (e: java.net.SocketTimeoutException) {
                Result.failure(Exception("Connection timeout. Please check your internet connection."))
            } catch (e: java.net.UnknownHostException) {
                Result.failure(Exception("Cannot reach server. Please check your internet connection."))
            } catch (e: java.io.IOException) {
                Result.failure(Exception("Network error. Please check your internet connection."))
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

    suspend fun sendMessage(roomId: String, content: String): Result<ChymeMessage> {
        return try {
            val request = SendMessageRequest(content = content)
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


