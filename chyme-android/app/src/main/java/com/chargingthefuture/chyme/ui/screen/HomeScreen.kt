package com.chargingthefuture.chyme.ui.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.lazy.items
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.unit.size
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.chargingthefuture.chyme.components.Avatar
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.data.model.ChymeUser
import com.chargingthefuture.chyme.ui.viewmodel.HomeViewModel
import com.chargingthefuture.chyme.ui.viewmodel.AuthViewModel

@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = hiltViewModel(),
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val authState by authViewModel.uiState.collectAsState()
    var showCreateRoom by remember { mutableStateOf(false) }
    val lifecycleOwner = LocalLifecycleOwner.current
    
    // Track navigation state to refresh when returning to home screen
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    // Refresh rooms when screen becomes visible (e.g., when navigating back from room detail)
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.refresh()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }
    
    // Also refresh when navigation state indicates we're on home screen
    LaunchedEffect(currentRoute) {
        if (currentRoute == "home") {
            viewModel.refresh()
        }
    }
    
    // Get user display text
    val userDisplayText = when {
        !authState.userDisplayName.isNullOrBlank() -> authState.userDisplayName
        !authState.userFirstName.isNullOrBlank() -> {
            if (!authState.userLastName.isNullOrBlank()) {
                "${authState.userFirstName} ${authState.userLastName}"
            } else {
                authState.userFirstName
            }
        }
        !authState.userEmail.isNullOrBlank() -> authState.userEmail?.takeWhile { it != '@' } ?: "User"
        else -> null
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chyme") },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh Rooms")
                    }
                    // User profile button with name/avatar
                    if (userDisplayText != null) {
                        Row(
                            modifier = Modifier
                                .clickable { navController.navigate("profile") }
                                .padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Avatar
                            Avatar(
                                user = ChymeUser(
                                    id = authState.userId ?: "",
                                    email = authState.userEmail,
                                    firstName = authState.userFirstName,
                                    lastName = authState.userLastName,
                                    displayName = authState.userDisplayName,
                                    profileImageUrl = null // TODO: Add profileImageUrl to AuthUiState if available
                                ),
                                size = 32.dp
                            )
                            // User name (truncated if too long)
                            Text(
                                text = userDisplayText,
                                style = MaterialTheme.typography.body2,
                                maxLines = 1,
                                modifier = Modifier.widthIn(max = 120.dp)
                            )
                        }
                    } else {
                        IconButton(onClick = { navController.navigate("profile") }) {
                            Icon(Icons.Default.Person, contentDescription = "Profile")
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateRoom = true },
                modifier = Modifier.padding(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create Room")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search bar
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.searchRooms(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Search rooms...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                singleLine = true
            )
            
            // Filter chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                @OptIn(ExperimentalMaterialApi::class)
                FilterChip(
                    selected = uiState.selectedRoomType == null,
                    onClick = { viewModel.loadRooms(null) }
                ) {
                    Text("All")
                }
                @OptIn(ExperimentalMaterialApi::class)
                FilterChip(
                    selected = uiState.selectedRoomType == "public",
                    onClick = { viewModel.loadRooms("public") }
                ) {
                    Text("Public")
                }
                @OptIn(ExperimentalMaterialApi::class)
                FilterChip(
                    selected = uiState.selectedRoomType == "private",
                    onClick = { viewModel.loadRooms("private") }
                ) {
                    Text("Private")
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Room list
            when {
                uiState.isLoading && uiState.rooms.isEmpty() -> {
                    // Only show loading spinner if we have no rooms
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                uiState.filteredRooms.isEmpty() && !uiState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (uiState.hasStaleData) {
                                "No rooms match your filters (showing last known data)."
                            } else {
                                "No rooms found"
                            }
                        )
                    }
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Show error banner at top if there's an error but we have rooms to show
                        uiState.errorMessage?.let { error ->
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    backgroundColor = MaterialTheme.colors.error.copy(alpha = 0.1f)
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = error,
                                            color = MaterialTheme.colors.error,
                                            style = MaterialTheme.typography.caption,
                                            modifier = Modifier.weight(1f)
                                        )
                                        TextButton(onClick = { 
                                            viewModel.clearError()
                                            viewModel.refresh()
                                        }) {
                                            Text("Retry", style = MaterialTheme.typography.caption)
                                        }
                                    }
                                }
                            }
                        }
                        
                        items(uiState.filteredRooms) { room ->
                            RoomCard(
                                room = room,
                                onClick = {
                                    navController.navigate("room/${room.id}")
                                }
                            )
                        }
                    }
                }
            }
        }
    }
    
    if (showCreateRoom) {
        CreateRoomScreen(
            onDismiss = { showCreateRoom = false },
            onRoomCreated = { room ->
                showCreateRoom = false
                navController.navigate("room/${room.id}")
            }
        )
    }
}

@Composable
fun RoomCard(
    room: ChymeRoom,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = room.name,
                    style = MaterialTheme.typography.h6,
                    fontWeight = FontWeight.Bold
                )
                @OptIn(ExperimentalMaterialApi::class)
                Chip(
                    onClick = { },
                    colors = ChipDefaults.chipColors(
                        backgroundColor = if (room.roomType == "public") 
                            MaterialTheme.colors.primary 
                        else 
                            MaterialTheme.colors.secondary
                    )
                ) {
                    Text(
                        text = room.roomType.uppercase(),
                        style = MaterialTheme.typography.caption
                    )
                }
            }
            
            if (!room.description.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = room.description,
                    style = MaterialTheme.typography.body2,
                    color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f)
                )
            }

            if (!room.pinnedLink.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colors.primary
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = room.pinnedLink,
                        style = MaterialTheme.typography.caption,
                        maxLines = 1,
                        color = MaterialTheme.colors.primary
                    )
                }
            }

            if (!room.topic.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colors.primary
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = room.topic,
                        style = MaterialTheme.typography.caption,
                        color = MaterialTheme.colors.primary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${room.currentParticipants}${room.maxParticipants?.let { "/$it" } ?: ""}",
                        style = MaterialTheme.typography.caption
                    )
                }
                if (room.isActive) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colors.error)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Live",
                            style = MaterialTheme.typography.caption,
                            color = MaterialTheme.colors.error
                        )
                    }
                }
            }
        }
    }
}

