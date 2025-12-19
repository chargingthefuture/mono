package com.chargingthefuture.chyme.ui.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chargingthefuture.chyme.auth.MobileAuthManager
import com.chargingthefuture.chyme.utils.SentryHelper
import io.sentry.SentryLevel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val errorMessage: String? = null,
    val userId: String? = null,
    val userEmail: String? = null,
    val userDisplayName: String? = null,
    val userFirstName: String? = null,
    val userLastName: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    application: Application,
    private val authManager: MobileAuthManager
) : AndroidViewModel(application) {
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    init {
        SentryHelper.addBreadcrumb(
            message = "AuthViewModel initialized",
            category = "viewmodel",
            level = SentryLevel.DEBUG
        )
        
        // Auth is not implemented yet - user needs to authenticate via web
        _uiState.value = _uiState.value.copy(isAuthenticated = false)
        
        // Observe user info from auth manager
        viewModelScope.launch {
            combine(
                authManager.userId,
                authManager.userEmail,
                authManager.userDisplayName,
                authManager.userFirstName,
                authManager.userLastName
            ) { userId, email, displayName, firstName, lastName ->
                _uiState.value = _uiState.value.copy(
                    userId = userId,
                    userEmail = email,
                    userDisplayName = displayName,
                    userFirstName = firstName,
                    userLastName = lastName
                )
            }.collect { }
        }
        
        Log.d("AuthViewModel", "AuthViewModel initialized - authentication not yet implemented")
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    fun setAuthenticated(isAuthenticated: Boolean) {
        _uiState.value = _uiState.value.copy(isAuthenticated = isAuthenticated, errorMessage = null)
    }
    
    fun setError(message: String) {
        _uiState.value = _uiState.value.copy(errorMessage = message)
    }
    
    fun signOut() {
        viewModelScope.launch {
            try {
                authManager.signOut()
                _uiState.value = _uiState.value.copy(
                    isAuthenticated = false,
                    errorMessage = null
                )
                SentryHelper.addBreadcrumb(
                    message = "User signed out",
                    category = "auth",
                    level = SentryLevel.INFO
                )
            } catch (e: Exception) {
                Log.e("AuthViewModel", "Failed to sign out", e)
                _uiState.value = _uiState.value.copy(
                    isAuthenticated = false,
                    errorMessage = "Failed to sign out: ${e.message}"
                )
            }
        }
    }
}

