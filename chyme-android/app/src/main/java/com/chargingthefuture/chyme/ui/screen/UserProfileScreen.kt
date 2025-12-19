package com.chargingthefuture.chyme.ui.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.chargingthefuture.chyme.ui.viewmodel.UserProfileViewModel

@Composable
fun UserProfileScreen(
    userId: String,
    navController: NavController,
    viewModel: UserProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(userId) {
        viewModel.loadUser(userId)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("User Profile") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when {
            uiState.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            uiState.errorMessage != null && uiState.user == null -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = uiState.errorMessage ?: "Failed to load user",
                        color = MaterialTheme.colors.error,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    Button(onClick = { viewModel.loadUser(userId) }) {
                        Text("Retry")
                    }
                }
            }
            else -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    // Profile avatar
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colors.primary.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colors.primary
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // User display name
                    val displayText = when {
                        !uiState.user?.displayName.isNullOrBlank() -> uiState.user?.displayName
                        !uiState.user?.firstName.isNullOrBlank() -> {
                            if (!uiState.user?.lastName.isNullOrBlank()) {
                                "${uiState.user?.firstName} ${uiState.user?.lastName}"
                            } else {
                                uiState.user?.firstName
                            }
                        }
                        !uiState.user?.email.isNullOrBlank() -> uiState.user?.email
                        else -> "User"
                    }
                    
                    Text(
                        text = displayText ?: "User",
                        style = MaterialTheme.typography.h5,
                        fontWeight = FontWeight.Bold
                    )
                    
                    if (!uiState.user?.email.isNullOrBlank() && displayText != uiState.user?.email) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = uiState.user?.email ?: "",
                            style = MaterialTheme.typography.body2,
                            color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f)
                        )
                    }
                    
                    if (!uiState.user?.username.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "@${uiState.user?.username}",
                            style = MaterialTheme.typography.caption,
                            color = MaterialTheme.colors.primary
                        )
                    }
                    
                    if (!uiState.user?.id.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "ID: ${uiState.user?.id}",
                            style = MaterialTheme.typography.caption,
                            color = MaterialTheme.colors.onSurface.copy(alpha = 0.5f)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(48.dp))
                    
                    // Action buttons
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = 2.dp
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Follow/Unfollow button
                            Button(
                                onClick = { viewModel.toggleFollow(userId) },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = !uiState.isLoadingFollowStatus && uiState.user != null
                            ) {
                                if (uiState.isLoadingFollowStatus) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        color = MaterialTheme.colors.onPrimary
                                    )
                                } else {
                                    Icon(
                                        if (uiState.isFollowing) Icons.Default.Person else Icons.Default.Person,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(if (uiState.isFollowing) "Unfollow" else "Follow")
                                }
                            }
                            
                            // Block/Unblock button
                            Button(
                                onClick = { viewModel.toggleBlock(userId) },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = !uiState.isLoadingBlockStatus && uiState.user != null,
                                colors = ButtonDefaults.buttonColors(
                                    backgroundColor = if (uiState.isBlocked) MaterialTheme.colors.error else MaterialTheme.colors.secondary
                                )
                            ) {
                                if (uiState.isLoadingBlockStatus) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        color = MaterialTheme.colors.onPrimary
                                    )
                                } else {
                                    Icon(
                                        if (uiState.isBlocked) Icons.Default.Close else Icons.Default.Warning,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(if (uiState.isBlocked) "Unblock" else "Block")
                                }
                            }
                        }
                    }
                    
                    // Error message
                    uiState.errorMessage?.let { errorMessage ->
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = errorMessage,
                            color = MaterialTheme.colors.error,
                            style = MaterialTheme.typography.caption
                        )
                    }
                }
            }
        }
    }
}

