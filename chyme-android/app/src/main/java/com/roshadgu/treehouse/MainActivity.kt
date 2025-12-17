package com.roshadgu.treehouse

import android.os.Bundle
import android.util.Log
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import com.roshadgu.treehouse.auth.OTPAuthManager
import com.roshadgu.treehouse.components.homeScreen
import com.roshadgu.treehouse.ui.screen.SignInScreen
import com.roshadgu.treehouse.ui.theme.TreehouseTheme
import com.roshadgu.treehouse.ui.viewmodel.AuthViewModel
import com.roshadgu.treehouse.utils.SentryHelper
import io.sentry.SentryLevel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val authManager = OTPAuthManager(this)
        
        // Load stored auth token in background
        CoroutineScope(Dispatchers.IO).launch {
            try {
                authManager.loadStoredToken()
            } catch (e: Exception) {
                SentryHelper.captureException(
                    throwable = e,
                    level = SentryLevel.ERROR,
                    tags = mapOf("activity" to "main_init"),
                    extra = mapOf("error_type" to e.javaClass.simpleName),
                    message = "Failed to load stored token in MainActivity onCreate"
                )
                Log.e("MainActivity", "Failed to load stored token", e)
            }
        }
        
        setContent {
            TreehouseTheme {
                MainScreen(authManager)
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        SentryHelper.addBreadcrumb(
            message = "MainActivity resumed",
            category = "activity",
            level = SentryLevel.DEBUG
        )
    }
    
    override fun onPause() {
        super.onPause()
        SentryHelper.addBreadcrumb(
            message = "MainActivity paused",
            category = "activity",
            level = SentryLevel.DEBUG
        )
    }
}

@Composable
fun MainScreen(authManager: OTPAuthManager) {
    val authViewModel: AuthViewModel = viewModel()
    
    // Observe authentication status from ViewModel (primary source - updated when OTP succeeds)
    val uiState by authViewModel.uiState.collectAsState()
    
    // Also observe authManager Flow for initial state and persistence checks
    var authManagerAuthenticated by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        // Check initial auth state from DataStore
        authManager.isAuthenticated.collect { authenticated ->
            Log.d("MainScreen", "authManager.isAuthenticated changed: $authenticated")
            authManagerAuthenticated = authenticated
            // Sync ViewModel state if authManager says we're authenticated
            if (authenticated && !uiState.isAuthenticated) {
                Log.d("MainScreen", "Syncing ViewModel state from authManager")
                authViewModel.uiState.value = authViewModel.uiState.value.copy(
                    isAuthenticated = true
                )
            }
        }
    }
    
    // Use ViewModel state as primary (updated immediately on OTP success)
    // Fall back to authManager state for initial load
    val isAuthenticated = uiState.isAuthenticated || authManagerAuthenticated
    
    Log.d("MainScreen", "isAuthenticated: $isAuthenticated (ViewModel: ${uiState.isAuthenticated}, authManager: $authManagerAuthenticated)")
    
    Surface(color = MaterialTheme.colors.background) {
        if (isAuthenticated) {
            homeScreen()
        } else {
            SignInScreen(
                viewModel = authViewModel,
                onSignInSuccess = {
                    // ViewModel state is already updated by validateOTP success handler
                    // The MainScreen will automatically re-compose when uiState.isAuthenticated changes
                    Log.d("MainScreen", "onSignInSuccess called")
                }
            )
        }
    }
}
