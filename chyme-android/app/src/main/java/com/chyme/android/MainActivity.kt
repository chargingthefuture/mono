package com.chyme.android

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.chyme.android.auth.OTPAuthManager
import com.chyme.android.data.api.ApiClient
import com.chyme.android.ui.screen.*
import com.chyme.android.ui.theme.ChymeTheme
import com.chyme.android.ui.viewmodel.AuthViewModel
import com.chyme.android.ui.viewmodel.RoomDetailViewModel
import com.chyme.android.ui.viewmodel.RoomListViewModel
import io.sentry.Sentry

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            // Initialize OTPAuthManager and ApiClient
            val authManager = OTPAuthManager(this)
            ApiClient.initialize(authManager)
            
            setContent {
                ChymeTheme {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        try {
                            ChymeApp(this@MainActivity, authManager)
                        } catch (e: Exception) {
                            Log.e("MainActivity", "Error in ChymeApp composable", e)
                            Sentry.captureException(e)
                            // Fallback UI
                            androidx.compose.material3.Text(
                                text = "Error loading app. Please restart.",
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                    }
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "Fatal error in onCreate", e)
            io.sentry.Sentry.captureException(e)
            throw e
        }
    }
}

@Composable
fun ChymeApp(context: Context, authManager: OTPAuthManager) {
    val navController = rememberNavController()
    
    try {
        val authViewModel: AuthViewModel = viewModel { AuthViewModel(authManager) }
        
        val isSignedIn by authViewModel.isSignedIn.collectAsState()
        val user by authViewModel.user.collectAsState()
        val needsApproval = remember(user) { 
            user != null && !user.isApproved && !user.isAdmin 
        }
        val isAdmin = remember(user) { 
            user?.isAdmin == true 
        }
        
        Log.d("ChymeApp", "Auth state: isSignedIn=$isSignedIn, needsApproval=$needsApproval, user=${user?.id}")
        
        // Check auth state on startup
        LaunchedEffect(Unit) {
            Log.d("ChymeApp", "Loading user on startup")
            authViewModel.loadUser()
        }
        
        // Navigate based on auth state changes (only after initial load)
        LaunchedEffect(isSignedIn, needsApproval) {
            // Wait a bit to ensure NavHost is ready
            kotlinx.coroutines.delay(100)
            
            Log.d("ChymeApp", "Auth state changed, navigating. isSignedIn=$isSignedIn, needsApproval=$needsApproval")
            val currentRoute = navController.currentDestination?.route
            Log.d("ChymeApp", "Current route: $currentRoute")
            
            when {
                isSignedIn == null || isSignedIn == false -> {
                    // Unknown or not signed in, show sign in
                    if (currentRoute != "signin") {
                        Log.d("ChymeApp", "Navigating to signin")
                        try {
                            navController.navigate("signin") {
                                popUpTo(0) { inclusive = true }
                            }
                        } catch (e: Exception) {
                            Log.e("ChymeApp", "Error navigating to signin", e)
                        }
                    }
                }
                needsApproval -> {
                    if (currentRoute != "pending_approval") {
                        Log.d("ChymeApp", "Navigating to pending_approval")
                        try {
                            navController.navigate("pending_approval") {
                                popUpTo(0) { inclusive = true }
                            }
                        } catch (e: Exception) {
                            Log.e("ChymeApp", "Error navigating to pending_approval", e)
                        }
                    }
                }
                else -> {
                    if (currentRoute != "rooms") {
                        Log.d("ChymeApp", "Navigating to rooms")
                        try {
                            navController.navigate("rooms") {
                                popUpTo(0) { inclusive = true }
                            }
                        } catch (e: Exception) {
                            Log.e("ChymeApp", "Error navigating to rooms", e)
                        }
                    }
                }
            }
        }
        
        NavHost(
            navController = navController,
            startDestination = "signin" // Always start with signin, navigation will handle the rest
        ) {
            composable("signin") {
                Log.d("ChymeApp", "Rendering SignInScreen")
                SignInScreen(
                    onSignInClick = { otp ->
                        authViewModel.signInWithOTP(otp)
                    }
                )
            }
            
            composable("pending_approval") {
                PendingApprovalScreen(
                    viewModel = authViewModel
                )
            }
            
            composable("rooms") {
                RoomListScreen(
                    onRoomClick = { roomId ->
                        navController.navigate("room/$roomId")
                    },
                    onCreateRoomClick = {
                        navController.navigate("create_room")
                    },
                    isAdmin = isAdmin,
                    viewModel = viewModel { RoomListViewModel() }
                )
            }
            
            composable("room/{roomId}") { backStackEntry ->
                val roomId = backStackEntry.arguments?.getString("roomId") ?: ""
                RoomDetailScreen(
                    roomId = roomId,
                    isSignedIn = isSignedIn == true,
                    isApproved = user?.isApproved == true,
                    onBackClick = {
                        navController.popBackStack()
                    },
                    viewModel = viewModel { RoomDetailViewModel(roomId) }
                )
            }
            
            composable("create_room") {
                CreateRoomScreen(
                    onBackClick = {
                        navController.popBackStack()
                    },
                    onRoomCreated = { roomId ->
                        navController.popBackStack()
                        navController.navigate("room/$roomId")
                    },
                    viewModel = viewModel { com.chyme.android.ui.viewmodel.CreateRoomViewModel() }
                )
            }
        }
    } catch (e: Exception) {
        Log.e("ChymeApp", "Error in ChymeApp composable", e)
        Sentry.captureException(e)
        // Fallback UI
        androidx.compose.material3.Text(
            text = "Error loading app: ${e.message}",
            modifier = Modifier.padding(16.dp)
        )
    }
}

