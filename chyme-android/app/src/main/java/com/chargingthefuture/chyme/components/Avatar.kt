package com.chargingthefuture.chyme.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.Icon
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
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
            !user?.profileImageUrl.isNullOrBlank() -> {
                // Load profile image with error/loading handling
                val painter = rememberAsyncImagePainter(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(user?.profileImageUrl)
                        .build()
                )
                
                when (painter.state) {
                    is coil.compose.AsyncImagePainter.State.Error -> {
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
                    }
                    is coil.compose.AsyncImagePainter.State.Loading -> {
                        // Show loading state
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(size * 0.6f),
                            tint = MaterialTheme.colors.primary.copy(alpha = 0.5f)
                        )
                    }
                    else -> {
                        Image(
                            painter = painter,
                            contentDescription = "Profile picture",
                            modifier = Modifier
                                .size(size)
                                .clip(CircleShape)
                        )
                    }
                }
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
            !imageUrl.isNullOrBlank() -> {
                // Load profile image with error handling
                val painter = rememberAsyncImagePainter(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(imageUrl)
                        .build()
                )
                
                when (painter.state) {
                    is coil.compose.AsyncImagePainter.State.Error -> {
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
                    else -> {
                        Image(
                            painter = painter,
                            contentDescription = "Profile picture",
                            modifier = Modifier
                                .size(size)
                                .clip(CircleShape)
                        )
                    }
                }
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

