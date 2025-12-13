package com.chyme.android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.auth.OTPAuthManager
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

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
        viewModelScope.launch {
            authManager.user.collect { user ->
                _user.value = user
            }
        }
        loadUser()
    }
    
    fun loadUser() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = ApiClient.apiService.getCurrentUser()
                if (response.isSuccessful) {
                    _user.value = response.body()
                } else {
                    _error.value = "Failed to load user"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
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
                    _user.value = response.body()
                } else {
                    _error.value = "Failed to update Quora profile URL"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
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
                    _error.value = "Invalid OTP code. Please try again."
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to validate OTP"
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

