package com.chyme.android.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.chyme.android.R
import com.chyme.android.data.model.Message
import com.chyme.android.ui.viewmodel.RoomDetailViewModel

@Composable
fun RoomDetailScreen(
    roomId: String,
    isSignedIn: Boolean,
    isApproved: Boolean,
    onBackClick: () -> Unit,
    viewModel: RoomDetailViewModel = viewModel { RoomDetailViewModel(roomId) }
) {
    val room by viewModel.room.collectAsState()
    val messages by viewModel.messages.collectAsState()
    val isJoined by viewModel.isJoined.collectAsState()
    val isSpeaking by viewModel.isSpeaking.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    
    var messageText by remember { mutableStateOf("") }
    
    val canInteract = isSignedIn && isApproved
    val isPrivate = room?.roomType == "private"
    val canListen = !isPrivate || canInteract
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(room?.name ?: "Room") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
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
        ) {
            // Room info
            room?.let {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = it.name,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        if (!it.description.isNullOrBlank()) {
                            Text(
                                text = it.description,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                        Text(
                            text = "${it.currentParticipants ?: 0} / ${it.maxParticipants ?: 50} participants",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
            
            // Control buttons
            if (canListen) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (!isJoined && canInteract) {
                        Button(
                            onClick = { viewModel.joinRoom() },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Mic, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text(stringResource(R.string.join_room))
                        }
                    } else if (isJoined && canInteract) {
                        Button(
                            onClick = { viewModel.leaveRoom() },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Icon(Icons.Default.ExitToApp, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text(stringResource(R.string.leave_room))
                        }
                        
                        if (isJoined) {
                            Button(
                                onClick = { viewModel.toggleSpeaking() },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isSpeaking) 
                                        MaterialTheme.colorScheme.primary 
                                    else 
                                        MaterialTheme.colorScheme.secondary
                                )
                            ) {
                                Icon(
                                    if (isSpeaking) Icons.Default.Mic else Icons.Default.MicOff,
                                    contentDescription = null
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    if (isSpeaking) stringResource(R.string.speaking)
                                    else stringResource(R.string.listening)
                                )
                            }
                        }
                    } else {
                        // Not signed in or not approved - show message
                        Text(
                            text = stringResource(R.string.sign_in_required),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
            }
            
            // Messages
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages) { message ->
                    MessageItem(message = message)
                }
            }
            
            // Message input
            if (canInteract && isJoined) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        modifier = Modifier.weight(1f),
                        placeholder = { Text(stringResource(R.string.chat_hint)) },
                        singleLine = true
                    )
                    IconButton(
                        onClick = {
                            if (messageText.isNotBlank()) {
                                viewModel.sendMessage(messageText)
                                messageText = ""
                            }
                        }
                    ) {
                        Icon(Icons.Default.Send, contentDescription = stringResource(R.string.send))
                    }
                }
            } else if (!canInteract) {
                // Show read-only message
                Text(
                    text = stringResource(R.string.sign_in_required),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}

@Composable
fun MessageItem(message: Message) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = message.content,
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = message.createdAt,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

