package com.roshadgu.treehouse.ui.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.roshadgu.treehouse.utils.SentryHelper
import io.sentry.SentryLevel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val errorMessage: String? = null
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    
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
        _uiState.value = _uiState.value.copy(
            isAuthenticated = false,
            errorMessage = null
        )
    }
}

