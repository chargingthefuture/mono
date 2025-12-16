package com.roshadgu.treehouse.auth

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.roshadgu.treehouse.data.api.ApiClient
import com.roshadgu.treehouse.data.model.ValidateOTPRequest
import com.roshadgu.treehouse.data.model.ValidateOTPResponse
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import retrofit2.HttpException

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

object AuthToken {
    val TOKEN_KEY = stringPreferencesKey("auth_token")
    val USER_ID_KEY = stringPreferencesKey("user_id")
    val TOKEN_EXPIRES_AT_KEY = stringPreferencesKey("token_expires_at")
}

class OTPAuthManager(private val context: Context) {
    
    /**
     * Validate OTP code and store auth token
     * @param otp 6-digit OTP code
     * @return Result containing token info or error message
     */
    suspend fun validateOTP(otp: String): Result<ValidateOTPResponse> {
        return try {
            if (otp.length != 6) {
                return Result.failure(Exception("OTP must be 6 digits"))
            }
            
            val request = ValidateOTPRequest(otp = otp)
            val response = ApiClient.apiService.validateOTP(request)
            
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                
                // Store token in DataStore
                context.dataStore.edit { preferences ->
                    preferences[AuthToken.TOKEN_KEY] = tokenResponse.token
                    preferences[AuthToken.USER_ID_KEY] = tokenResponse.user.id
                    preferences[AuthToken.TOKEN_EXPIRES_AT_KEY] = tokenResponse.expiresAt
                }
                
                // Set token in API client
                ApiClient.setAuthToken(tokenResponse.token)
                
                Result.success(tokenResponse)
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                Result.failure(Exception("Failed to validate OTP: $errorBody"))
            }
        } catch (e: HttpException) {
            val errorMessage = when (e.code()) {
                400 -> "Invalid or expired OTP code"
                403 -> "User is not approved"
                404 -> "User not found"
                else -> "Server error: ${e.message()}"
            }
            Result.failure(Exception(errorMessage))
        } catch (e: Exception) {
            Result.failure(Exception("Network error: ${e.message}"))
        }
    }
    
    /**
     * Load stored auth token and set it in API client
     */
    suspend fun loadStoredToken() {
        context.dataStore.edit { preferences ->
            val token = preferences[AuthToken.TOKEN_KEY]
            if (token != null) {
                ApiClient.setAuthToken(token)
            }
        }
    }
    
    /**
     * Get current auth token
     */
    suspend fun getAuthToken(): String? {
        return context.dataStore.data.first()[AuthToken.TOKEN_KEY]
    }
    
    /**
     * Check if user is authenticated
     */
    val isAuthenticated: Flow<Boolean> = context.dataStore.data.map { preferences ->
        val token = preferences[AuthToken.TOKEN_KEY]
        val expiresAt = preferences[AuthToken.TOKEN_EXPIRES_AT_KEY]
        
        if (token != null && expiresAt != null) {
            // Check if token is still valid (not expired)
            try {
                val expiresAtTime = java.time.Instant.parse(expiresAt).toEpochMilli()
                val now = System.currentTimeMillis()
                now < expiresAtTime
            } catch (e: Exception) {
                false
            }
        } else {
            false
        }
    }
    
    /**
     * Get current user ID
     */
    val userId: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[AuthToken.USER_ID_KEY]
    }
    
    /**
     * Sign out - clear stored token
     */
    suspend fun signOut() {
        context.dataStore.edit { preferences ->
            preferences.remove(AuthToken.TOKEN_KEY)
            preferences.remove(AuthToken.USER_ID_KEY)
            preferences.remove(AuthToken.TOKEN_EXPIRES_AT_KEY)
        }
        ApiClient.setAuthToken(null)
    }
}

