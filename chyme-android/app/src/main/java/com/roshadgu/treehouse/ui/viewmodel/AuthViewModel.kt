package com.roshadgu.treehouse.ui.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.roshadgu.treehouse.auth.OTPAuthManager
import com.roshadgu.treehouse.utils.SentryHelper
import io.sentry.SentryLevel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val errorMessage: String? = null,
    val otpCode: String = ""
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val authManager = OTPAuthManager(application)
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    init {
        SentryHelper.addBreadcrumb(
            message = "AuthViewModel initialized",
            category = "viewmodel",
            level = SentryLevel.DEBUG
        )
        
        // Load stored token on init
        viewModelScope.launch {
            try {
                SentryHelper.addBreadcrumb(
                    message = "Loading stored token on ViewModel init",
                    category = "viewmodel",
                    level = SentryLevel.DEBUG
                )
                
                authManager.loadStoredToken()
                val token = authManager.getAuthToken()
                val isAuthenticated = token != null
                
                _uiState.value = _uiState.value.copy(isAuthenticated = isAuthenticated)
                
                SentryHelper.addBreadcrumb(
                    message = "Initial auth state determined",
                    category = "viewmodel",
                    level = SentryLevel.INFO,
                    data = mapOf("is_authenticated" to isAuthenticated.toString())
                )
                
                Log.d("AuthViewModel", "Initialized with authenticated state: $isAuthenticated")
            } catch (e: Exception) {
                SentryHelper.captureException(
                    throwable = e,
                    level = SentryLevel.ERROR,
                    tags = mapOf("viewmodel" to "init_error"),
                    extra = mapOf("error_type" to e.javaClass.simpleName),
                    message = "Failed to load stored token in AuthViewModel init"
                )
                Log.e("AuthViewModel", "Failed to load stored token on init", e)
            }
        }
    }
    
    fun validateOTP(otp: String) {
        // Normalize OTP: trim whitespace and ensure it's exactly 6 digits
        val normalizedOTP = otp.trim()
        
        SentryHelper.addBreadcrumb(
            message = "validateOTP called from ViewModel",
            category = "viewmodel",
            level = SentryLevel.INFO,
            data = mapOf(
                "otp_length" to normalizedOTP.length.toString(),
                "otp_original_length" to otp.length.toString()
            )
        )
        
        if (normalizedOTP.length != 6 || !normalizedOTP.all { it.isDigit() }) {
            val errorMessage = "OTP must be 6 digits"
            _uiState.value = _uiState.value.copy(
                errorMessage = errorMessage
            )
            
            SentryHelper.captureMessage(
                message = "OTP validation rejected: invalid length or format",
                level = SentryLevel.WARNING,
                tags = mapOf("otp_validation" to "invalid_length"),
                extra = mapOf("otp_length" to normalizedOTP.length)
            )
            
            Log.w("AuthViewModel", "OTP validation rejected: length=${normalizedOTP.length}")
            return
        }
        
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = null
                )
                
                SentryHelper.addBreadcrumb(
                    message = "Starting OTP validation in ViewModel",
                    category = "viewmodel",
                    level = SentryLevel.DEBUG
                )
                
                val result = authManager.validateOTP(normalizedOTP)
                
                result.fold(
                    onSuccess = { tokenResponse ->
                        // Only update UI state and log success after we confirm the Result is successful
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            isAuthenticated = true,
                            errorMessage = null,
                            otpCode = ""
                        )
                        
                        // Log success only after UI state is updated and we're certain of success
                        SentryHelper.addBreadcrumb(
                            message = "OTP validation completed successfully in ViewModel",
                            category = "viewmodel",
                            level = SentryLevel.INFO,
                            data = mapOf("user_id" to tokenResponse.user.id)
                        )
                        
                        Log.i("AuthViewModel", "OTP validation successful")
                    },
                    onFailure = { error ->
                        val errorMessage = error.message ?: "Failed to validate OTP"
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            isAuthenticated = false,
                            errorMessage = errorMessage
                        )
                        
                        SentryHelper.captureException(
                            throwable = error,
                            level = SentryLevel.ERROR,
                            tags = mapOf("otp_validation" to "viewmodel_error"),
                            extra = mapOf(
                                "error_message" to errorMessage,
                                "error_type" to error.javaClass.simpleName
                            ),
                            message = "OTP validation failed in ViewModel"
                        )
                        
                        Log.e("AuthViewModel", "OTP validation failed: $errorMessage", error)
                    }
                )
            } catch (e: Exception) {
                val errorMessage = "Unexpected error during OTP validation: ${e.message}"
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isAuthenticated = false,
                    errorMessage = errorMessage
                )
                
                SentryHelper.captureException(
                    throwable = e,
                    level = SentryLevel.ERROR,
                    tags = mapOf("otp_validation" to "unexpected_error"),
                    extra = mapOf("error_type" to e.javaClass.simpleName),
                    message = "Unexpected error in validateOTP ViewModel"
                )
                
                Log.e("AuthViewModel", "Unexpected error during OTP validation", e)
            }
        }
    }
    
    fun updateOTPCode(code: String) {
        _uiState.value = _uiState.value.copy(
            otpCode = code,
            errorMessage = null
        )
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    fun setAuthenticated(isAuthenticated: Boolean) {
        _uiState.value = _uiState.value.copy(isAuthenticated = isAuthenticated)
    }
    
    fun signOut() {
        viewModelScope.launch {
            authManager.signOut()
            _uiState.value = _uiState.value.copy(
                isAuthenticated = false,
                otpCode = ""
            )
        }
    }
}

