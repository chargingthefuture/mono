package com.roshadgu.treehouse.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.roshadgu.treehouse.auth.OTPAuthManager
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
        // Load stored token on init
        viewModelScope.launch {
            authManager.loadStoredToken()
            val token = authManager.getAuthToken()
            _uiState.value = _uiState.value.copy(isAuthenticated = token != null)
        }
    }
    
    fun validateOTP(otp: String) {
        if (otp.length != 6) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "OTP must be 6 digits"
            )
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                errorMessage = null
            )
            
            val result = authManager.validateOTP(otp)
            
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = true,
                        errorMessage = null,
                        otpCode = ""
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = false,
                        errorMessage = error.message ?: "Failed to validate OTP"
                    )
                }
            )
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

