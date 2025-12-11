package com.chyme.android.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.chyme.android.R
import com.chyme.android.ui.viewmodel.AuthViewModel

@Composable
fun PendingApprovalScreen(
    viewModel: AuthViewModel = viewModel()
) {
    var quoraHandle by remember { mutableStateOf("") }
    val user by viewModel.user.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    
    val currentQuoraUrl = user?.quoraProfileUrl ?: ""
    val existingHandle = currentQuoraUrl.replace(
        Regex("^https?://(www\\.)?quora\\.com/profile/", RegexOption.IGNORE_CASE),
        ""
    ).trim()
    
    LaunchedEffect(existingHandle) {
        if (quoraHandle.isEmpty() && existingHandle.isNotEmpty()) {
            quoraHandle = existingHandle
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = stringResource(R.string.pending_approval),
                    style = MaterialTheme.typography.headlineMedium
                )
                
                Text(
                    text = stringResource(R.string.pending_approval_message),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                OutlinedTextField(
                    value = quoraHandle,
                    onValueChange = { 
                        quoraHandle = it.replace(
                            Regex("^https?://(www\\.)?quora\\.com/profile/", RegexOption.IGNORE_CASE),
                            ""
                        ).replace("/", "")
                    },
                    label = { Text(stringResource(R.string.quora_profile_url)) },
                    placeholder = { Text("farah-brunache") },
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = {
                        Text(
                            text = "https://quora.com/profile/",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
                
                Text(
                    text = "Enter your Quora profile handle (e.g., \"farah-brunache\"). The full URL will be saved automatically.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                if (error != null) {
                    Text(
                        text = error ?: "",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                
                Button(
                    onClick = {
                        val fullUrl = if (quoraHandle.isNotBlank()) {
                            "https://quora.com/profile/${quoraHandle.trim()}"
                        } else {
                            null
                        }
                        viewModel.updateQuoraProfileUrl(fullUrl ?: "")
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading && quoraHandle.isNotBlank()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Text(stringResource(R.string.save_quora_url))
                    }
                }
            }
        }
    }
}

