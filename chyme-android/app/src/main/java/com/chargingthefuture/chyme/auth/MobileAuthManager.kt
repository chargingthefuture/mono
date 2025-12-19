package com.chargingthefuture.chyme.auth

import android.content.Context
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.chargingthefuture.chyme.data.api.ApiClient
import com.chargingthefuture.chyme.data.model.ValidateMobileCodeRequest
import com.chargingthefuture.chyme.data.model.ValidateMobileCodeResponse
import com.chargingthefuture.chyme.utils.SentryHelper
import io.sentry.SentryLevel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import retrofit2.HttpException

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

class MobileAuthManager(private val context: Context) {
    
    /**
     * Validate mobile auth code from deep link and store auth token
     * @param code 8-character alphanumeric code from deep link
     * @return Result containing token info or error message
     */
    suspend fun validateMobileCode(code: String): Result<ValidateMobileCodeResponse> {
        // Normalize code: trim whitespace and uppercase
        val normalizedCode = code.trim().uppercase()
        
        SentryHelper.addBreadcrumb(
            message = "Starting mobile code validation",
            category = "mobile_auth",
            level = SentryLevel.INFO,
            data = mapOf(
                "code_length" to normalizedCode.length.toString()
            )
        )
        
        return try {
            if (normalizedCode.length != 8 || !normalizedCode.all { it.isLetterOrDigit() }) {
                val error = Exception("Invalid code format")
                SentryHelper.captureException(
                    throwable = error,
                    level = SentryLevel.WARNING,
                    tags = mapOf("mobile_auth" to "invalid_format"),
                    extra = mapOf("code_length" to normalizedCode.length)
                )
                Log.w("MobileAuthManager", "Mobile code validation failed: invalid format ${normalizedCode.length}")
                return Result.failure(error)
            }
            
            SentryHelper.addBreadcrumb(
                message = "Mobile code format validated, creating request",
                category = "mobile_auth",
                level = SentryLevel.DEBUG
            )
            
            val request = ValidateMobileCodeRequest(code = normalizedCode)
            Log.d("MobileAuthManager", "Sending mobile code validation request")
            
            SentryHelper.addBreadcrumb(
                message = "Calling API to validate mobile code",
                category = "api",
                level = SentryLevel.DEBUG,
                data = mapOf("endpoint" to "/api/chyme/validate-mobile-code")
            )
            
            val response = ApiClient.apiService.validateMobileCode(request)
            
            Log.d("MobileAuthManager", "Mobile code validation response: isSuccessful=${response.isSuccessful}, code=${response.code()}")
            
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                
                SentryHelper.addBreadcrumb(
                    message = "Mobile code validated by server, received token response",
                    category = "mobile_auth",
                    level = SentryLevel.DEBUG,
                    data = mapOf(
                        "user_id" to tokenResponse.user.id,
                        "token_length" to tokenResponse.token.length.toString(),
                        "expires_at" to tokenResponse.expiresAt
                    )
                )
                
                try {
                    // Store token in DataStore (reuse same keys as OTP auth)
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
                    
                    SentryHelper.addBreadcrumb(
                        message = "All mobile auth validation steps completed successfully",
                        category = "mobile_auth",
                        level = SentryLevel.INFO,
                        data = mapOf("user_id" to tokenResponse.user.id)
                    )
                    
                    Log.i("MobileAuthManager", "Mobile code validation successful for user: ${tokenResponse.user.id}")
                    
                    Result.success(tokenResponse)
                } catch (e: Exception) {
                    val error = Exception("Failed to store token: ${e.message}", e)
                    SentryHelper.captureException(
                        throwable = error,
                        level = SentryLevel.ERROR,
                        tags = mapOf("mobile_auth" to "datastore_error"),
                        extra = mapOf(
                            "user_id" to tokenResponse.user.id,
                            "error_type" to e.javaClass.simpleName
                        ),
                        message = "Failed to store auth token after mobile code validation"
                    )
                    Log.e("MobileAuthManager", "Failed to store token", e)
                    Result.failure(error)
                }
            } else {
                val errorBody = try {
                    response.errorBody()?.string() ?: "Unknown error"
                } catch (e: Exception) {
                    "Failed to read error body: ${e.message}"
                }
                
                val error = Exception("Failed to validate mobile code: $errorBody")
                SentryHelper.captureException(
                    throwable = error,
                    level = SentryLevel.ERROR,
                    tags = mapOf(
                        "mobile_auth" to "api_error",
                        "http_status" to response.code().toString()
                    ),
                    extra = mapOf(
                        "http_code" to response.code(),
                        "error_body" to errorBody,
                        "response_message" to (response.message() ?: "null")
                    ),
                    message = "Mobile code validation API call failed"
                )
                Log.e("MobileAuthManager", "Mobile code validation failed: HTTP ${response.code()}, $errorBody")
                Result.failure(error)
            }
        } catch (e: HttpException) {
            val errorMessage = when (e.code()) {
                400 -> "Invalid or expired code"
                403 -> "User is not approved"
                404 -> "User not found"
                else -> "Server error: ${e.message()}"
            }
            val error = Exception(errorMessage, e)
            SentryHelper.captureException(
                throwable = error,
                level = SentryLevel.ERROR,
                tags = mapOf(
                    "mobile_auth" to "http_exception",
                    "http_status" to e.code().toString()
                ),
                extra = mapOf(
                    "http_code" to e.code(),
                    "error_message" to (e.message() ?: "null"),
                    "response_body" to (e.response()?.errorBody()?.string() ?: "null")
                ),
                message = "HTTP exception during mobile code validation"
            )
            Log.e("MobileAuthManager", "HTTP exception during mobile code validation: ${e.code()}", e)
            Result.failure(error)
        } catch (e: Exception) {
            val error = Exception("Network error: ${e.message}", e)
            SentryHelper.captureException(
                throwable = error,
                level = SentryLevel.ERROR,
                tags = mapOf("mobile_auth" to "network_error"),
                extra = mapOf(
                    "error_type" to e.javaClass.simpleName,
                    "error_message" to (e.message ?: "null"),
                    "error_cause" to (e.cause?.message ?: "null")
                ),
                message = "Network error during mobile code validation"
            )
            Log.e("MobileAuthManager", "Network error during mobile code validation", e)
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
                Log.d("MobileAuthManager", "Loaded stored token for user: $userId")
            } else {
                SentryHelper.addBreadcrumb(
                    message = "No stored token found",
                    category = "auth",
                    level = SentryLevel.DEBUG
                )
                Log.d("MobileAuthManager", "No stored token found")
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
            Log.e("MobileAuthManager", "Failed to load stored token", e)
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
            Log.d("MobileAuthManager", "User signed out")
        } catch (e: Exception) {
            SentryHelper.captureException(
                throwable = e,
                level = SentryLevel.ERROR,
                tags = mapOf("auth" to "sign_out_error"),
                extra = mapOf("error_type" to e.javaClass.simpleName),
                message = "Failed to sign out user"
            )
            Log.e("MobileAuthManager", "Failed to sign out", e)
            throw e
        }
    }
}

