package com.chargingthefuture.chyme.ui.screen

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.compose.foundation.background
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
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
    var showPinDialog by remember { mutableStateOf(false) }
    var pendingPinLink by remember { mutableStateOf("") }

    LaunchedEffect(roomId) {
        viewModel.loadRoom(roomId)
        if (!uiState.isJoined) {
            viewModel.joinRoom(roomId)
        }
    }

    // Lightweight polling to keep participants and messages fresh while in the room
    LaunchedEffect(roomId, uiState.isJoined) {
        if (!uiState.isJoined) return@LaunchedEffect
        while (true) {
            viewModel.loadParticipants(roomId)
            viewModel.loadMessages(roomId)
            kotlinx.coroutines.delay(5000)
        }
    }
    
    val context = LocalContext.current
    val scaffoldState = rememberScaffoldState()
    // Treat user as creator if their role is CREATOR or they match createdBy
    val isCreator = uiState.currentUserRole == ParticipantRole.CREATOR ||
        uiState.room?.createdBy == uiState.currentUserId
    
    // Check microphone permission
    val hasMicPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.RECORD_AUDIO
    ) == PackageManager.PERMISSION_GRANTED
    
    // Permission launcher
    val micPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            // Permission granted, proceed with mute toggle
            viewModel.toggleMute()
        } else {
            // Permission denied, explain why mic permission is needed
            val activity = (context as? android.app.Activity)
            val shouldShowRationale =
                activity?.shouldShowRequestPermissionRationale(Manifest.permission.RECORD_AUDIO) == true

            val message = if (shouldShowRationale) {
                "Mic access is required so others can hear you when you speak in this room."
            } else {
                "Mic access is disabled. Enable microphone permission in system settings to speak in rooms."
            }

            androidx.lifecycle.viewmodel.compose.viewModel<RoomViewModel>() // ensure ViewModel in composition
            androidx.compose.runtime.LaunchedEffect(message) {
                scaffoldState.snackbarHostState.showSnackbar(message)
            }
        }
    }
    
    // Request permission when joining room if user is a speaker/creator
    LaunchedEffect(uiState.isJoined, uiState.currentUserRole) {
        if (uiState.isJoined && 
            (uiState.currentUserRole == ParticipantRole.SPEAKER || uiState.currentUserRole == ParticipantRole.CREATOR) &&
            !hasMicPermission) {
            // Request permission when joining as speaker/creator
            micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }
    
    Scaffold(
        scaffoldState = scaffoldState,
        topBar = {
            TopAppBar(
                title = { Text(uiState.room?.name ?: "Room") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    // Share room link button
                    IconButton(onClick = {
                        val roomId = uiState.room?.id ?: return@IconButton
                        val roomLink = "https://app.chargingthefuture.com/app/chyme/room/$roomId"
                        shareRoomLink(context, roomLink)
                    }) {
                        Icon(Icons.Default.Share, contentDescription = "Share Room")
                    }
                    // End Room button (only for creator)
                    if (isCreator && uiState.room?.isActive == true) {
                        IconButton(onClick = {
                            viewModel.endRoom(roomId)
                            navController.popBackStack()
                        }) {
                            Icon(
                                Icons.Default.Delete,
                                contentDescription = "End Room",
                                tint = MaterialTheme.colors.error
                            )
                        }
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
                hasMicPermission = hasMicPermission,
                onToggleMute = {
                    if (hasMicPermission) {
                        viewModel.toggleMute()
                    } else {
                        // Request permission when user tries to toggle mute
                        micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    }
                },
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
                val errorMessage = uiState.errorMessage
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = errorMessage ?: "Unknown error",
                        color = MaterialTheme.colors.error,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    Button(onClick = { viewModel.loadRoom(roomId) }) {
                        Text("Retry")
                    }
                }
            }
            else -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                ) {
                    // Main scrollable content: room info, participants, messages
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Room info
                        item {
                            RoomInfoCard(
                                room = uiState.room,
                                isCreator = isCreator,
                                onPinnedLinkClick = { link ->
                                    runCatching {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link))
                                        context.startActivity(intent)
                                    }
                                },
                                onUpdatePinnedLink = {
                                    // Open simple dialog to enter a URL
                                    pendingPinLink = uiState.room?.pinnedLink ?: ""
                                    showPinDialog = true
                                },
                                onClearPinnedLink = {
                                    viewModel.updatePinnedLink(roomId, null)
                                }
                            )
                        }

                        // Chat messages
                        if (uiState.messages.isNotEmpty() || uiState.chatErrorMessage != null) {
                            item {
                                Column {
                                    Text(
                                        text = "Chat",
                                        style = MaterialTheme.typography.h6,
                                        fontWeight = FontWeight.Bold
                                    )
                                    uiState.chatErrorMessage?.let { chatError ->
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = chatError,
                                            style = MaterialTheme.typography.caption,
                                            color = MaterialTheme.colors.error
                                        )
                                    }
                                }
                            }
                            items(uiState.messages) { message ->
                                val authorName = when {
                                    message.isAnonymous -> "Anonymous"
                                    else -> {
                                        uiState.participants
                                            .find { it.userId == message.userId }
                                            ?.user?.displayName
                                            ?: "User"
                                    }
                                }
                                val isSelf = message.userId == uiState.currentUserId
                                MessageRow(
                                    authorName = authorName,
                                    isSelf = isSelf,
                                    message = message
                                )
                            }
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

                    // Chat input
                    ChatInput(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        onSend = { text ->
                            viewModel.sendMessage(roomId, text)
                        }
                    )
                }
            }
        }
    }

    if (showPinDialog) {
        AlertDialog(
            onDismissRequest = { showPinDialog = false },
            title = { Text("Pin a link") },
            text = {
                Column {
                    Text(
                        text = "Paste a URL to pin at the top of this room.",
                        style = MaterialTheme.typography.body2
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = pendingPinLink,
                        onValueChange = { pendingPinLink = it },
                        placeholder = { Text("https://example.com") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    val trimmed = pendingPinLink.trim()
                    val uri = android.net.Uri.parse(trimmed)
                    val valid = (uri.scheme == "http" || uri.scheme == "https") && !uri.host.isNullOrBlank()
                    if (valid) {
                        viewModel.updatePinnedLink(roomId, trimmed)
                        showPinDialog = false
                    }
                }) {
                    Text("Pin")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPinDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun MessageRow(
    authorName: String,
    isSelf: Boolean,
    message: com.chargingthefuture.chyme.data.model.ChymeMessage
) {
    val backgroundColor = if (isSelf) {
        MaterialTheme.colors.primary.copy(alpha = 0.08f)
    } else {
        MaterialTheme.colors.surface
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(backgroundColor)
            .padding(8.dp)
    ) {
        Text(
            text = authorName,
            style = MaterialTheme.typography.caption,
            color = MaterialTheme.colors.primary
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = message.content,
            style = MaterialTheme.typography.body2
        )
    }
}

@Composable
private fun ChatInput(
    modifier: Modifier = Modifier,
    onSend: (String) -> Unit
) {
    var text by remember { mutableStateOf("") }

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            modifier = Modifier.weight(1f),
            placeholder = { Text("Type a message...") },
            singleLine = true
        )
        Spacer(modifier = Modifier.width(8.dp))
        IconButton(
            onClick = {
                val trimmed = text.trim()
                if (trimmed.isNotEmpty()) {
                    onSend(trimmed)
                    text = ""
                }
            }
        ) {
            Icon(Icons.Default.Send, contentDescription = "Send")
        }
    }
}

@Composable
fun RoomInfoCard(
    room: com.chargingthefuture.chyme.data.model.ChymeRoom?,
    isCreator: Boolean,
    onPinnedLinkClick: (String) -> Unit,
    onUpdatePinnedLink: () -> Unit,
    onClearPinnedLink: () -> Unit
) {
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

            // Pinned link bar (if set)
            if (!room.pinnedLink.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(CircleShape)
                        .background(MaterialTheme.colors.primary.copy(alpha = 0.1f))
                        .clickable { onPinnedLinkClick(room.pinnedLink) }
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Link,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colors.primary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = room.pinnedLink,
                            style = MaterialTheme.typography.caption,
                            color = MaterialTheme.colors.primary
                        )
                    }
                    if (isCreator) {
                        IconButton(onClick = onClearPinnedLink) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Clear pinned link",
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            } else if (isCreator) {
                // Creator-only quick pin prompt when no link is set
                Spacer(modifier = Modifier.height(8.dp))
                TextButton(onClick = onUpdatePinnedLink) {
                    Text("Pin a link to this room")
                }
            }

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
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp))
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
                            Icon(Icons.Default.ArrowForward, contentDescription = "Promote to speaker")
                        }
                    }
                    IconButton(onClick = onMute) {
                        Icon(
                            if (participant.isMuted) Icons.Default.Close else Icons.Default.Check,
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
    hasMicPermission: Boolean = false,
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
                    Icon(Icons.Default.Add, contentDescription = null)
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
                        if (isMuted) Icons.Default.Close else Icons.Default.Check,
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

private fun shareRoomLink(context: Context, roomLink: String) {
    // Copy to clipboard
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val clip = ClipData.newPlainText("Room Link", roomLink)
    clipboard.setPrimaryClip(clip)
    
    // Also share via Android share intent
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, roomLink)
        putExtra(Intent.EXTRA_SUBJECT, "Join this Chyme room")
    }
    context.startActivity(Intent.createChooser(shareIntent, "Share Room Link"))
}

