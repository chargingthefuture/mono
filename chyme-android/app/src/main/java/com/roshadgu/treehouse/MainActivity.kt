package com.roshadgu.treehouse

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import com.roshadgu.treehouse.auth.MobileAuthManager
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
    private lateinit var authManager: MobileAuthManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        authManager = MobileAuthManager(this)
        
        // Load stored token in background
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
        
        // Handle deep link if app was opened via deep link
        handleDeepLink(intent)
        
        setContent {
            TreehouseTheme {
                MainScreen(authManager)
            }
        }
    }
    
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleDeepLink(intent)
    }
    
    private fun handleDeepLink(intent: Intent?) {
        if (intent?.data != null) {
            val uri: Uri = intent.data!!
            if (uri.scheme == "chyme" && uri.host == "auth") {
                val code = uri.getQueryParameter("code")
                if (code != null) {
                    Log.d("MainActivity", "Received deep link with code: ${code.take(2)}****")
                    
                    SentryHelper.addBreadcrumb(
                        message = "Deep link received for mobile auth",
                        category = "deep_link",
                        level = SentryLevel.INFO,
                        data = mapOf("has_code" to "true")
                    )
                    
                    // Validate code in background
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val result = authManager.validateMobileCode(code)
                            result.fold(
                                onSuccess = {
                                    Log.i("MainActivity", "Mobile auth successful")
                                    SentryHelper.addBreadcrumb(
                                        message = "Mobile auth successful via deep link",
                                        category = "auth",
                                        level = SentryLevel.INFO,
                                        data = mapOf("user_id" to it.user.id)
                                    )
                                    // Update UI will happen automatically via auth state flow
                                },
                                onFailure = { error ->
                                    Log.e("MainActivity", "Mobile auth failed", error)
                                    SentryHelper.captureException(
                                        throwable = error,
                                        level = SentryLevel.ERROR,
                                        tags = mapOf("auth" to "deep_link_failed"),
                                        message = "Failed to authenticate via deep link"
                                    )
                                }
                            )
                        } catch (e: Exception) {
                            Log.e("MainActivity", "Error processing deep link", e)
                            SentryHelper.captureException(
                                throwable = e,
                                level = SentryLevel.ERROR,
                                tags = mapOf("auth" to "deep_link_error"),
                                message = "Error processing deep link"
                            )
                        }
                    }
                }
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
fun MainScreen(authManager: MobileAuthManager) {
    val authViewModel: AuthViewModel = viewModel()
    val uiState by authViewModel.uiState.collectAsState()
    
    // Observe auth state from MobileAuthManager
    var authManagerAuthenticated by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        authManager.isAuthenticated.collect { authenticated ->
            authManagerAuthenticated = authenticated
            // Sync ViewModel state if authManager says we're authenticated
            if (authenticated && !uiState.isAuthenticated) {
                Log.d("MainScreen", "Syncing ViewModel state from authManager")
                authViewModel.setAuthenticated(true)
            }
        }
    }
    
    // Use ViewModel state as primary, fall back to authManager state
    val isAuthenticated = uiState.isAuthenticated || authManagerAuthenticated
    
    Surface(color = MaterialTheme.colors.background) {
        if (isAuthenticated) {
            homeScreen()
        } else {
            SignInScreen(
                viewModel = authViewModel,
                onSignInSuccess = {
                    // Authentication successful
                }
            )
        }
    }
}
