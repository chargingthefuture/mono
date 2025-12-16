package com.chyme.android

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
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
                        ChymeApp(this@MainActivity, authManager)
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
    val authViewModel: AuthViewModel = viewModel { AuthViewModel(authManager) }
    
    val isSignedIn by authViewModel.isSignedIn.collectAsState()
    val user by authViewModel.user.collectAsState()
    val needsApproval = authViewModel.needsApproval
    val isAdmin = authViewModel.isAdmin
    
    // Check auth state on startup
    LaunchedEffect(Unit) {
        authViewModel.loadUser()
    }
    
    // Determine start destination based on auth state
    val startDestination = remember(isSignedIn, needsApproval) {
        when {
            isSignedIn == null -> "signin" // Unknown state, show sign in
            isSignedIn == false -> "signin"
            needsApproval -> "pending_approval"
            else -> "rooms"
        }
    }
    
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable("signin") {
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
}

