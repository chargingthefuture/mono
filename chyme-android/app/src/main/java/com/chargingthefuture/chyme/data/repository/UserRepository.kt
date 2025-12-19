package com.chargingthefuture.chyme.data.repository

import com.chargingthefuture.chyme.data.api.ApiClient
import com.chargingthefuture.chyme.data.model.ChymeUser
import com.chargingthefuture.chyme.data.model.FollowStatusResponse
import com.chargingthefuture.chyme.data.model.BlockStatusResponse
import javax.inject.Inject
import javax.inject.Singleton

class UserRepository {
    private val apiService = ApiClient.apiService
    
    suspend fun getUser(userId: String): Result<ChymeUser> {
        return try {
            val response = apiService.getUser(userId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getFollowStatus(userId: String): Result<Boolean> {
        return try {
            val response = apiService.getFollowStatus(userId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.isFollowing)
            } else {
                Result.failure(Exception("Failed to get follow status: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getBlockStatus(userId: String): Result<Boolean> {
        return try {
            val response = apiService.getBlockStatus(userId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.isBlocked)
            } else {
                Result.failure(Exception("Failed to get block status: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
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


