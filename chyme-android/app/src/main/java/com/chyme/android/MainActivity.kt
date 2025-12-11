package com.chyme.android

import android.content.Context
import android.os.Bundle
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
import com.chyme.android.auth.ClerkAuthManager
import com.chyme.android.data.api.ApiClient
import com.chyme.android.ui.screen.*
import com.chyme.android.ui.theme.ChymeTheme
import com.chyme.android.ui.viewmodel.AuthViewModel
import com.chyme.android.ui.viewmodel.RoomDetailViewModel
import com.chyme.android.ui.viewmodel.RoomListViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize ClerkAuthManager and ApiClient
        val authManager = ClerkAuthManager(this)
        ApiClient.initialize(authManager)
        
        setContent {
            ChymeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ChymeApp(this, authManager)
                }
            }
        }
    }
}

@Composable
fun ChymeApp(context: Context, authManager: ClerkAuthManager) {
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
    
    NavHost(
        navController = navController,
        startDestination = when {
            isSignedIn == false -> "signin"
            needsApproval -> "pending_approval"
            else -> "rooms"
        }
    ) {
        composable("signin") {
            SignInScreen(
                onSignInClick = {
                    authViewModel.signIn()
                },
                onSignUpClick = {
                    // Navigate to sign up or handle sign up
                    authViewModel.signIn() // For now, same as sign in
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

