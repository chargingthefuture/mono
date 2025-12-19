package com.chargingthefuture.chyme.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.ui.viewmodel.CreateRoomViewModel

@Composable
fun CreateRoomScreen(
    onDismiss: () -> Unit,
    onRoomCreated: (ChymeRoom) -> Unit,
    viewModel: CreateRoomViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Room") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = uiState.name,
                    onValueChange = { viewModel.updateName(it) },
                    label = { Text("Room Name *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                OutlinedTextField(
                    value = uiState.description,
                    onValueChange = { viewModel.updateDescription(it) },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
                
                OutlinedTextField(
                    value = uiState.topic,
                    onValueChange = { viewModel.updateTopic(it) },
                    label = { Text("Topic/Interest") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    RadioButton(
                        selected = uiState.roomType == "public",
                        onClick = { viewModel.updateRoomType("public") }
                    )
                    Text("Public", modifier = Modifier.padding(top = 12.dp))
                    
                    Spacer(modifier = Modifier.width(16.dp))
                    
                    RadioButton(
                        selected = uiState.roomType == "private",
                        onClick = { viewModel.updateRoomType("private") }
                    )
                    Text("Private", modifier = Modifier.padding(top = 12.dp))
                }
                
                OutlinedTextField(
                    value = uiState.maxParticipants?.toString() ?: "",
                    onValueChange = {
                        viewModel.updateMaxParticipants(it.toIntOrNull())
                    },
                    label = { Text("Max Participants (50-100)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                uiState.errorMessage?.let { errorMessage ->
                    Text(
                        text = errorMessage,
                        color = MaterialTheme.colors.error,
                        style = MaterialTheme.typography.caption
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    viewModel.createRoom(onRoomCreated)
                },
                enabled = !uiState.isLoading && uiState.name.isNotBlank()
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = MaterialTheme.colors.onPrimary
                    )
                } else {
                    Text("Create")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

