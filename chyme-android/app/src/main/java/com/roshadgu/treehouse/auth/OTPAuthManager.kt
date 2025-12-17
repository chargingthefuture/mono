package com.roshadgu.treehouse.auth

import android.content.Context
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.roshadgu.treehouse.data.api.ApiClient
import com.roshadgu.treehouse.data.model.ValidateOTPRequest
import com.roshadgu.treehouse.data.model.ValidateOTPResponse
import com.roshadgu.treehouse.utils.SentryHelper
import io.sentry.SentryLevel
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
        // Normalize OTP: trim whitespace
        val normalizedOTP = otp.trim()
        
        SentryHelper.addBreadcrumb(
            message = "Starting OTP validation",
            category = "otp",
            level = SentryLevel.INFO,
            data = mapOf(
                "otp_length" to normalizedOTP.length.toString(),
                "otp_original_length" to otp.length.toString()
            )
        )
        
        return try {
            if (normalizedOTP.length != 6 || !normalizedOTP.all { it.isDigit() }) {
                val error = Exception("OTP must be 6 digits")
                SentryHelper.captureException(
                    throwable = error,
                    level = SentryLevel.WARNING,
                    tags = mapOf("otp_validation" to "invalid_length"),
                    extra = mapOf(
                        "otp_length" to normalizedOTP.length,
                        "otp_code" to normalizedOTP.take(2) + "****"
                    )
                )
                Log.w("OTPAuthManager", "OTP validation failed: invalid length ${normalizedOTP.length}")
                return Result.failure(error)
            }
            
            SentryHelper.addBreadcrumb(
                message = "OTP length validated, creating request",
                category = "otp",
                level = SentryLevel.DEBUG
            )
            
            val request = ValidateOTPRequest(otp = normalizedOTP)
            Log.d("OTPAuthManager", "Sending OTP validation request")
            
            SentryHelper.addBreadcrumb(
                message = "Calling API to validate OTP",
                category = "api",
                level = SentryLevel.DEBUG,
                data = mapOf("endpoint" to "/api/chyme/validate-otp")
            )
            
            val response = ApiClient.apiService.validateOTP(request)
            
            Log.d("OTPAuthManager", "OTP validation response: isSuccessful=${response.isSuccessful}, code=${response.code()}")
            
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                
                SentryHelper.addBreadcrumb(
                    message = "OTP validated by server, received token response",
                    category = "otp",
                    level = SentryLevel.DEBUG,
                    data = mapOf(
                        "user_id" to tokenResponse.user.id,
                        "token_length" to tokenResponse.token.length.toString(),
                        "expires_at" to tokenResponse.expiresAt
                    )
                )
                
                try {
                    // Store token in DataStore
                    context.dataStore.edit { preferences ->
                        preferences[AuthToken.TOKEN_KEY] = tokenResponse.token
                        preferences[AuthToken.USER_ID_KEY] = tokenResponse.user.id
                        preferences[AuthToken.TOKEN_EXPIRES_AT_KEY] = tokenResponse.expiresAt
                    }
                    
                    SentryHelper.addBreadcrumb(
                        message = "Token stored in DataStore successfully",
                        category = "datastore",
                        level = SentryLevel.DEBUG
                    )
                    
                    // Set token in API client
                    ApiClient.setAuthToken(tokenResponse.token)
                    
                    // Set Sentry user
                    SentryHelper.setUser(
                        userId = tokenResponse.user.id,
                        email = tokenResponse.user.email
                    )
                    
                    // Only log success AFTER all operations complete successfully
                    SentryHelper.addBreadcrumb(
                        message = "All OTP validation steps completed successfully",
                        category = "otp",
                        level = SentryLevel.INFO,
                        data = mapOf("user_id" to tokenResponse.user.id)
                    )
                    
                    Log.i("OTPAuthManager", "OTP validation successful for user: ${tokenResponse.user.id}")
                    
                    // Return success only after everything is complete
                    Result.success(tokenResponse)
                } catch (e: Exception) {
                    val error = Exception("Failed to store token: ${e.message}", e)
                    SentryHelper.captureException(
                        throwable = error,
                        level = SentryLevel.ERROR,
                        tags = mapOf("otp_validation" to "datastore_error"),
                        extra = mapOf(
                            "user_id" to tokenResponse.user.id,
                            "error_type" to e.javaClass.simpleName
                        ),
                        message = "Failed to store auth token after OTP validation"
                    )
                    Log.e("OTPAuthManager", "Failed to store token", e)
                    Result.failure(error)
                }
            } else {
                val errorBody = try {
                    response.errorBody()?.string() ?: "Unknown error"
                } catch (e: Exception) {
                    "Failed to read error body: ${e.message}"
                }
                
                val error = Exception("Failed to validate OTP: $errorBody")
                SentryHelper.captureException(
                    throwable = error,
                    level = SentryLevel.ERROR,
                    tags = mapOf(
                        "otp_validation" to "api_error",
                        "http_status" to response.code().toString()
                    ),
                    extra = mapOf(
                        "http_code" to response.code(),
                        "error_body" to errorBody,
                        "response_message" to (response.message() ?: "null")
                    ),
                    message = "OTP validation API call failed"
                )
                Log.e("OTPAuthManager", "OTP validation failed: HTTP ${response.code()}, $errorBody")
                Result.failure(error)
            }
        } catch (e: HttpException) {
            val errorMessage = when (e.code()) {
                400 -> "Invalid or expired OTP code"
                403 -> "User is not approved"
                404 -> "User not found"
                else -> "Server error: ${e.message()}"
            }
            val error = Exception(errorMessage, e)
            SentryHelper.captureException(
                throwable = error,
                level = SentryLevel.ERROR,
                tags = mapOf(
                    "otp_validation" to "http_exception",
                    "http_status" to e.code().toString()
                ),
                extra = mapOf(
                    "http_code" to e.code(),
                    "error_message" to (e.message() ?: "null"),
                    "response_body" to (e.response()?.errorBody()?.string() ?: "null")
                ),
                message = "HTTP exception during OTP validation"
            )
            Log.e("OTPAuthManager", "HTTP exception during OTP validation: ${e.code()}", e)
            Result.failure(error)
        } catch (e: Exception) {
            val error = Exception("Network error: ${e.message}", e)
            SentryHelper.captureException(
                throwable = error,
                level = SentryLevel.ERROR,
                tags = mapOf("otp_validation" to "network_error"),
                extra = mapOf(
                    "error_type" to e.javaClass.simpleName,
                    "error_message" to (e.message ?: "null"),
                    "error_cause" to (e.cause?.message ?: "null")
                ),
                message = "Network error during OTP validation"
            )
            Log.e("OTPAuthManager", "Network error during OTP validation", e)
            Result.failure(error)
        }
    }
    
    /**
     * Load stored auth token and set it in API client
     */
    suspend fun loadStoredToken() {
        SentryHelper.addBreadcrumb(
            message = "Loading stored auth token",
            category = "auth",
            level = SentryLevel.DEBUG
        )
        
        try {
            val preferences = context.dataStore.data.first()
            val token = preferences[AuthToken.TOKEN_KEY]
            val userId = preferences[AuthToken.USER_ID_KEY]
            val expiresAt = preferences[AuthToken.TOKEN_EXPIRES_AT_KEY]
            
            if (token != null) {
                ApiClient.setAuthToken(token)
                SentryHelper.setUser(userId = userId)
                
                SentryHelper.addBreadcrumb(
                    message = "Stored token loaded successfully",
                    category = "auth",
                    level = SentryLevel.INFO,
                    data = mapOf(
                        "has_token" to "true",
                        "has_user_id" to (userId != null).toString(),
                        "has_expires_at" to (expiresAt != null).toString()
                    )
                )
                Log.d("OTPAuthManager", "Loaded stored token for user: $userId")
            } else {
                SentryHelper.addBreadcrumb(
                    message = "No stored token found",
                    category = "auth",
                    level = SentryLevel.DEBUG
                )
                Log.d("OTPAuthManager", "No stored token found")
            }
        } catch (e: Exception) {
            SentryHelper.captureException(
                throwable = e,
                level = SentryLevel.ERROR,
                tags = mapOf("auth" to "load_token_error"),
                extra = mapOf(
                    "error_type" to e.javaClass.simpleName,
                    "error_message" to (e.message ?: "null")
                ),
                message = "Failed to load stored auth token"
            )
            Log.e("OTPAuthManager", "Failed to load stored token", e)
            throw e
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
        SentryHelper.addBreadcrumb(
            message = "Signing out user",
            category = "auth",
            level = SentryLevel.INFO
        )
        
        try {
            context.dataStore.edit { preferences ->
                preferences.remove(AuthToken.TOKEN_KEY)
                preferences.remove(AuthToken.USER_ID_KEY)
                preferences.remove(AuthToken.TOKEN_EXPIRES_AT_KEY)
            }
            ApiClient.setAuthToken(null)
            SentryHelper.setUser(null)
            
            SentryHelper.captureMessage(
                message = "User signed out successfully",
                level = SentryLevel.INFO,
                tags = mapOf("auth" to "sign_out")
            )
            Log.d("OTPAuthManager", "User signed out")
        } catch (e: Exception) {
            SentryHelper.captureException(
                throwable = e,
                level = SentryLevel.ERROR,
                tags = mapOf("auth" to "sign_out_error"),
                extra = mapOf("error_type" to e.javaClass.simpleName),
                message = "Failed to sign out user"
            )
            Log.e("OTPAuthManager", "Failed to sign out", e)
            throw e
        }
    }
}

