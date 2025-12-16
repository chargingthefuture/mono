package com.chyme.android.ui.screen

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.chyme.android.R

@Composable
fun SignInScreen(
    onSignInClick: (String) -> Unit
) {
    var otpCode by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Chyme logo
        Image(
            painter = painterResource(id = R.drawable.chyme_logo),
            contentDescription = "Chyme Logo",
            modifier = Modifier.size(120.dp)
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "Chyme",
            style = MaterialTheme.typography.headlineLarge,
            color = Color(0xFF4CAF50) // Chyme green
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Text(
            text = "Enter One-Time Passcode",
            style = MaterialTheme.typography.titleMedium
        )
        
        Text(
            text = "Get your OTP code from the Chyme web app",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = otpCode,
            onValueChange = { 
                otpCode = it.filter { char -> char.isDigit() }.take(6)
                errorMessage = null
            },
            label = { Text("OTP Code") },
            placeholder = { Text("000000") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            isError = errorMessage != null,
            supportingText = errorMessage?.let { 
                { Text(it, color = MaterialTheme.colorScheme.error) }
            }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = {
                if (otpCode.length == 6) {
                    onSignInClick(otpCode)
                } else {
                    errorMessage = "Please enter a 6-digit OTP code"
                }
            },
            enabled = otpCode.length == 6,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
        ) {
            Text("Sign In")
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Only approved users can access the Android app",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

