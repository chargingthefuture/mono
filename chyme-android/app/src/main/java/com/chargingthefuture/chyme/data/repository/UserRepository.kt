package com.chargingthefuture.chyme.data.repository

import com.chargingthefuture.chyme.data.api.ApiClient
import javax.inject.Inject
import javax.inject.Singleton

class UserRepository {
    private val apiService = ApiClient.apiService
    
    suspend fun followUser(userId: String): Result<Unit> {
        return try {
            val response = apiService.followUser(userId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to follow user: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun unfollowUser(userId: String): Result<Unit> {
        return try {
            val response = apiService.unfollowUser(userId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to unfollow user: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun blockUser(userId: String): Result<Unit> {
        return try {
            val response = apiService.blockUser(userId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to block user: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}


