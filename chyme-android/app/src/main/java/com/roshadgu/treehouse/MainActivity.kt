package com.roshadgu.treehouse

import android.os.Bundle
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
    var isAuthenticated by remember { mutableStateOf(false) }
    
    // Observe authentication status from authManager (source of truth)
    LaunchedEffect(Unit) {
        authManager.isAuthenticated.collect { authenticated ->
            isAuthenticated = authenticated
        }
    }
    
    Surface(color = MaterialTheme.colors.background) {
        if (isAuthenticated) {
            homeScreen()
        } else {
            SignInScreen(
                viewModel = authViewModel,
                onSignInSuccess = {
                    // Token is already stored in DataStore by validateOTP,
                    // so the Flow will automatically update isAuthenticated
                }
            )
        }
    }
}
