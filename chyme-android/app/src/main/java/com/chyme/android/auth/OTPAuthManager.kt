package com.chyme.android.auth

import android.content.Context
import android.content.SharedPreferences
import com.chyme.android.data.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

class OTPAuthManager(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("chyme_auth", Context.MODE_PRIVATE)
    private val AUTH_TOKEN_KEY = "auth_token"
    private val USER_ID_KEY = "user_id"
    
    private val _isSignedIn = MutableStateFlow<Boolean?>(null)
    val isSignedIn: StateFlow<Boolean?> = _isSignedIn.asStateFlow()
    
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    
    init {
        // Check if user is already signed in
        checkAuthState()
    }
    
    /**
     * Get the current auth token for API authentication
     */
    fun getAuthToken(): String? {
        return prefs.getString(AUTH_TOKEN_KEY, null)
    }
    
    /**
     * Save auth token after successful OTP validation
     */
    fun saveAuthToken(token: String, userId: String?) {
        prefs.edit()
            .putString(AUTH_TOKEN_KEY, token)
            .putString(USER_ID_KEY, userId)
            .apply()
        checkAuthState()
    }
    
    /**
     * Check current authentication state
     */
    fun checkAuthState() {
        val token = getAuthToken()
        _isSignedIn.value = token != null
    }
    
    /**
     * Sign out - clear stored token
     */
    fun signOut() {
        prefs.edit()
            .remove(AUTH_TOKEN_KEY)
            .remove(USER_ID_KEY)
            .apply()
        _isSignedIn.value = false
        _user.value = null
    }
    
    /**
     * Get current user ID
     */
    fun getUserId(): String? {
        return prefs.getString(USER_ID_KEY, null)
    }
    
    /**
     * Check if user needs approval
     */
    fun needsApproval(): Boolean {
        val currentUser = _user.value
        return currentUser != null && !currentUser.isApproved && !currentUser.isAdmin
    }
    
    /**
     * Check if user is admin
     */
    fun isAdmin(): Boolean {
        return _user.value?.isAdmin == true
    }
    
    /**
     * Update the local user data (called after fetching from platform API)
     */
    fun updateUser(user: User?) {
        _user.value = user
    }
}
