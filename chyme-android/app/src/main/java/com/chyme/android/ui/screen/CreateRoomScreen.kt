package com.chyme.android.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.chyme.android.R
import com.chyme.android.ui.viewmodel.CreateRoomViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateRoomScreen(
    onBackClick: () -> Unit,
    onRoomCreated: (String) -> Unit,
    viewModel: CreateRoomViewModel = viewModel()
) {
    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var roomType by remember { mutableStateOf("public") }
    var maxParticipants by remember { mutableStateOf("50") }
    
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val createdRoom by viewModel.createdRoom.collectAsState()
    
    LaunchedEffect(createdRoom) {
        createdRoom?.let {
            onRoomCreated(it.id)
            viewModel.clearCreatedRoom()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.create_room)) },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text(stringResource(R.string.room_name)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text(stringResource(R.string.room_description)) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                maxLines = 5
            )
            
            // Room type selection
            Text(
                text = "Room Type",
                style = MaterialTheme.typography.labelLarge
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = roomType == "public",
                    onClick = { roomType = "public" },
                    label = { Text(stringResource(R.string.room_type_public)) }
                )
                FilterChip(
                    selected = roomType == "private",
                    onClick = { roomType = "private" },
                    label = { Text(stringResource(R.string.room_type_private)) }
                )
            }
            
            OutlinedTextField(
                value = maxParticipants,
                onValueChange = { 
                    if (it.all { char -> char.isDigit() }) {
                        maxParticipants = it
                    }
                },
                label = { Text("Max Participants") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            
            if (error != null) {
                Text(
                    text = error ?: "Error",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            Button(
                onClick = {
                    viewModel.createRoom(
                        name = name,
                        description = if (description.isBlank()) null else description,
                        roomType = roomType,
                        maxParticipants = maxParticipants.toIntOrNull()
                    )
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading && name.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text(stringResource(R.string.create_room))
                }
            }
        }
    }
}

