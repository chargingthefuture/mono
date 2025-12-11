package com.chyme.android.auth

import android.content.Context
import com.chyme.android.BuildConfig
import com.chyme.android.data.model.User
import com.clerk.Clerk
import com.clerk.models.User as ClerkUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

class ClerkAuthManager(private val context: Context) {
    private val _isSignedIn = MutableStateFlow<Boolean?>(null)
    val isSignedIn: StateFlow<Boolean?> = _isSignedIn.asStateFlow()
    
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val clerk = Clerk.instance
    
    init {
        // Check initial auth state
        checkAuthState()
    }
    
    /**
     * Get the current Clerk session token for API authentication
     */
    suspend fun getSessionToken(): String? {
        return try {
            val session = clerk.session
            session?.getToken()?.await()
        } catch (e: Exception) {
            android.util.Log.e("ClerkAuthManager", "Error getting session token", e)
            null
        }
    }
    
    /**
     * Check current authentication state
     */
    suspend fun checkAuthState() {
        _isLoading.value = true
        try {
            val clerkUser = clerk.user
            val session = clerk.session
            
            _isSignedIn.value = clerkUser != null && session != null
            
            // If signed in, we'll fetch user data from platform API
            // The platform API will sync Clerk user to our database
        } catch (e: Exception) {
            android.util.Log.e("ClerkAuthManager", "Error checking auth state", e)
            _isSignedIn.value = false
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Sign in using Clerk
     * This will open Clerk's sign-in UI
     */
    suspend fun signIn() {
        _isLoading.value = true
        try {
            // Clerk handles sign-in through their UI components
            // You'll need to use Clerk's SignIn composable or activity
            // For now, we'll just check the state after sign-in
            checkAuthState()
        } catch (e: Exception) {
            android.util.Log.e("ClerkAuthManager", "Error during sign in", e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Sign up using Clerk
     * This will open Clerk's sign-up UI
     */
    suspend fun signUp() {
        _isLoading.value = true
        try {
            // Clerk handles sign-up through their UI components
            // You'll need to use Clerk's SignUp composable or activity
            // For now, we'll just check the state after sign-up
            checkAuthState()
        } catch (e: Exception) {
            android.util.Log.e("ClerkAuthManager", "Error during sign up", e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Sign out from Clerk
     */
    suspend fun signOut() {
        _isLoading.value = true
        try {
            clerk.signOut()
            _isSignedIn.value = false
            _user.value = null
        } catch (e: Exception) {
            android.util.Log.e("ClerkAuthManager", "Error during sign out", e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get current Clerk user ID
     */
    fun getUserId(): String? {
        return clerk.user?.id
    }
    
    /**
     * Get current Clerk user
     */
    fun getClerkUser(): ClerkUser? {
        return clerk.user
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
