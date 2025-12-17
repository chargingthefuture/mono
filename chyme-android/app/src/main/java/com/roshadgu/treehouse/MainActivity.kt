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
            authManager.loadStoredToken()
        }
        
        setContent {
            TreehouseTheme {
                MainScreen(authManager)
            }
        }
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
