package com.chyme.android.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.auth.OTPAuthManager
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.User
import io.sentry.Sentry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

class AuthViewModel(private val authManager: OTPAuthManager) : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    val isSignedIn: StateFlow<Boolean?> = authManager.isSignedIn
    val needsApproval: Boolean
        get() = authManager.needsApproval()
    val isAdmin: Boolean
        get() = authManager.isAdmin()
    
    init {
        try {
            viewModelScope.launch {
                try {
                    authManager.user.collect { user ->
                        _user.value = user
                    }
                } catch (e: Exception) {
                    Log.e("AuthViewModel", "Error collecting user state", e)
                    Sentry.captureException(e)
                }
            }
            // Don't call loadUser() in init - let the UI call it explicitly
            // This prevents crashes on startup if API is not available
        } catch (e: Exception) {
            Log.e("AuthViewModel", "Error in init", e)
            Sentry.captureException(e)
        }
    }
    
    fun loadUser() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = ApiClient.apiService.getCurrentUser()
                if (response.isSuccessful) {
                    val user = response.body()
                    _user.value = user
                    // Sync to authManager so needsApproval and isAdmin work correctly
                    authManager.updateUser(user)
                } else {
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Failed to load user (code=$code, error=$errorBodyString)"
                    Log.e("AuthViewModel", detailedMessage)
                    Sentry.captureMessage("getCurrentUser API failed: $detailedMessage")
                    _error.value = "Failed to load user"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }
                Log.e("AuthViewModel", "Exception while loading user: $message", e)
                Sentry.captureException(e)
                _error.value = message
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun updateQuoraProfileUrl(url: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = ApiClient.apiService.updateQuoraProfileUrl(
                    mapOf("quoraProfileUrl" to url)
                )
                if (response.isSuccessful) {
                    val user = response.body()
                    _user.value = user
                    // Sync to authManager so needsApproval and isAdmin work correctly
                    authManager.updateUser(user)
                } else {
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Failed to update Quora profile URL (code=$code, error=$errorBodyString)"
                    Log.e("AuthViewModel", detailedMessage)
                    Sentry.captureMessage("updateQuoraProfileUrl API failed: $detailedMessage")
                    _error.value = "Failed to update Quora profile URL"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }
                Log.e("AuthViewModel", "Exception while updating Quora profile URL: $message", e)
                Sentry.captureException(e)
                _error.value = message
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun signInWithOTP(otp: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = ApiClient.apiService.validateOTP(
                    com.chyme.android.data.model.ValidateOTPRequest(otp = otp)
                )
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    authManager.saveAuthToken(body.token, body.user.id)
                    authManager.updateUser(body.user)
                    _user.value = body.user
                } else {
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Invalid OTP (code=$code, error=$errorBodyString)"
                    Log.e("AuthViewModel", detailedMessage)
                    Sentry.captureMessage("validateOTP API failed: $detailedMessage")
                    _error.value = "Invalid OTP code. Please try again."
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Failed to validate OTP"
                }
                Log.e("AuthViewModel", "Exception while validating OTP: $message", e)
                Sentry.captureException(e)
                _error.value = message
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun signOut() {
        viewModelScope.launch {
            authManager.signOut()
            _user.value = null
        }
    }
}

