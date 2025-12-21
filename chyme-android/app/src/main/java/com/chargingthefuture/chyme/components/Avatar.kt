package com.chargingthefuture.chyme.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.Icon
import androidx.compose.material.Icons
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.icons.filled.Person
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.chargingthefuture.chyme.data.model.ChymeUser

/**
 * Reusable avatar component that loads user profile images.
 * Falls back to initials or icon if image is not available.
 */
@Composable
fun Avatar(
    user: ChymeUser?,
    size: Dp = 40.dp,
    modifier: Modifier = Modifier
) {
    val displayName = user?.displayName
        ?: (if (!user?.firstName.isNullOrBlank()) {
            if (!user?.lastName.isNullOrBlank()) {
                "${user?.firstName} ${user?.lastName}"
            } else {
                user?.firstName
            }
        } else {
            user?.email?.takeWhile { it != '@' } ?: "U"
        }) ?: "U"
    
    val initials = displayName
        .split(" ")
        .take(2)
        .mapNotNull { it.firstOrNull()?.uppercase() }
        .joinToString("")
        .take(2)
    
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(MaterialTheme.colors.primary.copy(alpha = 0.2f)),
        contentAlignment = Alignment.Center
    ) {
        when {
            !user?.profileImageUrl.isNullOrBlank() -> {
                // Load profile image
                AsyncImage(
                    model = user?.profileImageUrl,
                    contentDescription = "Profile picture",
                    modifier = Modifier
                        .size(size)
                        .clip(CircleShape),
                    onError = {
                        // Fallback to initials on error
                        Text(
                            text = initials,
                            style = MaterialTheme.typography.body2.copy(
                                fontSize = (size.value * 0.4).sp,
                                fontWeight = FontWeight.Bold
                            ),
                            color = MaterialTheme.colors.primary,
                            textAlign = TextAlign.Center
                        )
                    },
                    onLoading = {
                        // Show loading state (could be a progress indicator)
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(size * 0.6f),
                            tint = MaterialTheme.colors.primary.copy(alpha = 0.5f)
                        )
                    }
                )
            }
            initials.length >= 2 -> {
                // Show initials
                Text(
                    text = initials,
                    style = MaterialTheme.typography.body2.copy(
                        fontSize = (size.value * 0.4).sp,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MaterialTheme.colors.primary,
                    textAlign = TextAlign.Center
                )
            }
            else -> {
                // Fallback to icon
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(size * 0.6f),
                    tint = MaterialTheme.colors.primary
                )
            }
        }
    }
}

/**
 * Avatar component that takes a profile image URL directly.
 */
@Composable
fun Avatar(
    imageUrl: String?,
    displayName: String? = null,
    size: Dp = 40.dp,
    modifier: Modifier = Modifier
) {
    val initials = displayName
        ?.split(" ")
        ?.take(2)
        ?.mapNotNull { it.firstOrNull()?.uppercase() }
        ?.joinToString("")
        ?.take(2)
        ?: "U"
    
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(MaterialTheme.colors.primary.copy(alpha = 0.2f)),
        contentAlignment = Alignment.Center
    ) {
        when {
            !imageUrl.isNullOrBlank() -> {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = "Profile picture",
                    modifier = Modifier
                        .size(size)
                        .clip(CircleShape),
                    onError = {
                        if (initials.length >= 2) {
                            Text(
                                text = initials,
                                style = MaterialTheme.typography.body2.copy(
                                    fontSize = (size.value * 0.4).sp,
                                    fontWeight = FontWeight.Bold
                                ),
                                color = MaterialTheme.colors.primary,
                                textAlign = TextAlign.Center
                            )
                        } else {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = null,
                                modifier = Modifier.size(size * 0.6f),
                                tint = MaterialTheme.colors.primary
                            )
                        }
                    }
                )
            }
            initials.length >= 2 -> {
                Text(
                    text = initials,
                    style = MaterialTheme.typography.body2.copy(
                        fontSize = (size.value * 0.4).sp,
                        fontWeight = FontWeight.Bold
                    ),
                    color = MaterialTheme.colors.primary,
                    textAlign = TextAlign.Center
                )
            }
            else -> {
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(size * 0.6f),
                    tint = MaterialTheme.colors.primary
                )
            }
        }
    }
}

