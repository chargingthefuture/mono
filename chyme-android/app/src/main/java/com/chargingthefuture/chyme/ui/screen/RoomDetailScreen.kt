package com.chargingthefuture.chyme.ui.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.chargingthefuture.chyme.data.model.ParticipantRole
import com.chargingthefuture.chyme.ui.viewmodel.RoomViewModel

@Composable
fun RoomDetailScreen(
    roomId: String,
    navController: NavController,
    viewModel: RoomViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(roomId) {
        viewModel.loadRoom(roomId)
        if (!uiState.isJoined) {
            viewModel.joinRoom(roomId)
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState.room?.name ?: "Room") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            RoomControls(
                roomId = roomId,
                isMuted = uiState.isMuted,
                hasRaisedHand = uiState.hasRaisedHand,
                currentRole = uiState.currentUserRole,
                onToggleMute = { viewModel.toggleMute() },
                onRaiseHand = { viewModel.raiseHand(roomId) },
                onLeaveRoom = {
                    viewModel.leaveRoom(roomId)
                    navController.popBackStack()
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
            uiState.errorMessage != null -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = uiState.errorMessage,
                        color = MaterialTheme.colors.error,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    Button(onClick = { viewModel.loadRoom(roomId) }) {
                        Text("Retry")
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Room info
                    item {
                        RoomInfoCard(room = uiState.room)
                    }
                    
                    // Speakers section
                    if (uiState.speakers.isNotEmpty()) {
                        item {
                            Text(
                                text = "Speakers",
                                style = MaterialTheme.typography.h6,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        items(uiState.speakers) { participant ->
                            ParticipantCard(
                                participant = participant,
                                isCreator = uiState.room?.createdBy == participant.userId,
                                canManage = uiState.room?.createdBy == participant.userId || 
                                          uiState.currentUserRole == ParticipantRole.CREATOR,
                                onPromoteToSpeaker = {
                                    if (participant.role != ParticipantRole.SPEAKER) {
                                        viewModel.promoteToSpeaker(roomId, participant.userId)
                                    }
                                },
                                onMute = {
                                    viewModel.muteParticipant(roomId, participant.userId, !participant.isMuted)
                                },
                                onKick = {
                                    viewModel.kickParticipant(roomId, participant.userId)
                                }
                            )
                        }
                    }
                    
                    // Listeners section
                    if (uiState.listeners.isNotEmpty()) {
                        item {
                            Text(
                                text = "Listeners",
                                style = MaterialTheme.typography.h6,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        items(uiState.listeners) { participant ->
                            ParticipantCard(
                                participant = participant,
                                isCreator = false,
                                canManage = uiState.room?.createdBy == participant.userId || 
                                          uiState.currentUserRole == ParticipantRole.CREATOR,
                                onPromoteToSpeaker = {
                                    viewModel.promoteToSpeaker(roomId, participant.userId)
                                },
                                onMute = {
                                    viewModel.muteParticipant(roomId, participant.userId, !participant.isMuted)
                                },
                                onKick = {
                                    viewModel.kickParticipant(roomId, participant.userId)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RoomInfoCard(room: com.chargingthefuture.chyme.data.model.ChymeRoom?) {
    if (room == null) return
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = room.name,
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold
            )
            if (!room.description.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = room.description,
                    style = MaterialTheme.typography.body2
                )
            }
            if (!room.topic.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Label,
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
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.People, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${room.currentParticipants}${room.maxParticipants?.let { "/$it" } ?: ""}",
                        style = MaterialTheme.typography.caption
                    )
                }
                if (room.isActive) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.FiberManualRecord,
                            contentDescription = null,
                            modifier = Modifier.size(12.dp),
                            tint = MaterialTheme.colors.error
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

@Composable
fun ParticipantCard(
    participant: com.chargingthefuture.chyme.data.model.ChymeRoomParticipant,
    isCreator: Boolean,
    canManage: Boolean,
    onPromoteToSpeaker: () -> Unit,
    onMute: () -> Unit,
    onKick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Avatar placeholder
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .clickable { },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, contentDescription = null)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = participant.user?.displayName 
                            ?: participant.user?.firstName 
                            ?: "User",
                        fontWeight = FontWeight.Medium
                    )
                    if (isCreator) {
                        Text(
                            text = "Creator",
                            style = MaterialTheme.typography.caption,
                            color = MaterialTheme.colors.primary
                        )
                    }
                }
            }
            
            if (canManage && !isCreator) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (participant.role == com.chargingthefuture.chyme.data.model.ParticipantRole.LISTENER) {
                        IconButton(onClick = onPromoteToSpeaker) {
                            Icon(Icons.Default.Mic, contentDescription = "Promote to speaker")
                        }
                    }
                    IconButton(onClick = onMute) {
                        Icon(
                            if (participant.isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                            contentDescription = if (participant.isMuted) "Unmute" else "Mute"
                        )
                    }
                    IconButton(onClick = onKick) {
                        Icon(Icons.Default.Close, contentDescription = "Kick")
                    }
                }
            }
        }
    }
}

@Composable
fun RoomControls(
    roomId: String,
    isMuted: Boolean,
    hasRaisedHand: Boolean,
    currentRole: ParticipantRole?,
    onToggleMute: () -> Unit,
    onRaiseHand: () -> Unit,
    onLeaveRoom: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        elevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (currentRole == ParticipantRole.LISTENER && !hasRaisedHand) {
                Button(onClick = onRaiseHand) {
                    Icon(Icons.Default.PanTool, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Raise Hand")
                }
            }
            
            if (currentRole == ParticipantRole.SPEAKER || currentRole == ParticipantRole.CREATOR) {
                IconButton(
                    onClick = onToggleMute,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                        contentDescription = if (isMuted) "Unmute" else "Mute",
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
            
            IconButton(
                onClick = onLeaveRoom,
                modifier = Modifier.size(56.dp)
            ) {
                Icon(
                    Icons.Default.ExitToApp,
                    contentDescription = "Leave Room",
                    modifier = Modifier.size(32.dp),
                    tint = MaterialTheme.colors.error
                )
            }
        }
    }
}

