package com.chargingthefuture.chyme.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.chargingthefuture.chyme.components.Avatar
import com.chargingthefuture.chyme.data.model.ChymeUser
import com.chargingthefuture.chyme.ui.viewmodel.AuthViewModel

@Composable
fun ProfileScreen(
    navController: NavController,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by authViewModel.uiState.collectAsState()
    var showSignOutDialog by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))
            
            // Profile avatar
            Avatar(
                user = ChymeUser(
                    id = uiState.userId ?: "",
                    email = uiState.userEmail,
                    firstName = uiState.userFirstName,
                    lastName = uiState.userLastName,
                    displayName = uiState.userDisplayName,
                    profileImageUrl = null // TODO: Add profileImageUrl to AuthUiState if available
                ),
                size = 120.dp
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // User display name or email
            val displayText = when {
                !uiState.userDisplayName.isNullOrBlank() -> uiState.userDisplayName
                !uiState.userFirstName.isNullOrBlank() -> {
                    if (!uiState.userLastName.isNullOrBlank()) {
                        "${uiState.userFirstName} ${uiState.userLastName}"
                    } else {
                        uiState.userFirstName
                    }
                }
                !uiState.userEmail.isNullOrBlank() -> uiState.userEmail
                else -> "User"
            }
            
            Text(
                text = displayText ?: "User",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            
            if (!uiState.userEmail.isNullOrBlank() && displayText != uiState.userEmail) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = uiState.userEmail ?: "",
                    style = MaterialTheme.typography.body2,
                    color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f)
                )
            }
            
            if (!uiState.userId.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "ID: ${uiState.userId}",
                    style = MaterialTheme.typography.caption,
                    color = MaterialTheme.colors.onSurface.copy(alpha = 0.5f)
                )
            }
            
            Spacer(modifier = Modifier.height(48.dp))
            
            // Account Management Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = 2.dp
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Account Management",
                        style = MaterialTheme.typography.h6,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    
                    // Switch Account button
                    Button(
                        onClick = {
                            showSignOutDialog = true
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = MaterialTheme.colors.secondary
                        )
                    ) {
                        Icon(
                            Icons.Default.AccountCircle,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Switch Account")
                    }
                    
                    // Sign Out button
                    OutlinedButton(
                        onClick = {
                            showSignOutDialog = true
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colors.error
                        )
                    ) {
                        Icon(
                            Icons.Default.ExitToApp,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Sign Out")
                    }
                }
            }
        }
    }
    
    // Sign out confirmation dialog
    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            title = { Text("Sign Out") },
            text = { Text("Are you sure you want to sign out? You'll need to authenticate again to use the app.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSignOutDialog = false
                        authViewModel.signOut()
                        // Navigation will be handled by MainScreen observing auth state
                    }
                ) {
                    Text("Sign Out", color = MaterialTheme.colors.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSignOutDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

