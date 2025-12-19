package com.chargingthefuture.chyme.components

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.chargingthefuture.chyme.R
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.ui.theme.nunito_fonts

@Composable
fun RoomCard(room: ChymeRoom) {
    Box(
        modifier = Modifier
            .width(343.dp)
            .height(196.dp)
            .padding(10.dp)
            .clip(
                RoundedCornerShape(
                    topStart = 20.dp,
                    topEnd = 20.dp,
                    bottomStart = 20.dp,
                    bottomEnd = 20.dp
                )
            )
            .background(Color(red = 0.9960784316062927f, green = 1f, blue = 1f, alpha = 1f))
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            // Use a default icon or placeholder for room image
            Image(
                modifier = Modifier
                    .padding(start = 15.dp)
                    .size(60.dp),
                painter = painterResource(id = R.drawable.user_icon),
                contentDescription = "Room icon"
            )
            Column(modifier = Modifier.padding(start = 30.dp, top = 10.dp)) {
                Text(
                    text = room.name,
                    fontWeight = FontWeight.Bold,
                    fontFamily = nunito_fonts
                )
                
                // Description or room type
                if (!room.description.isNullOrBlank()) {
                    Text(
                        text = room.description,
                        modifier = Modifier.padding(top = 4.dp),
                        maxLines = 2
                    )
                } else {
                    Text(
                        text = room.roomType.capitalize(),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                    // Show current participants as listeners
                    Text(
                        text = room.currentParticipants.toString(),
                        modifier = Modifier.padding(end = 3.dp)
                    )
                    Image(
                        painter = painterResource(id = R.drawable.user_icon),
                        contentDescription = "Listeners",
                        modifier = Modifier.size(13.dp)
                    )
                    Text("/", modifier = Modifier.padding(start = 8.dp, end = 5.dp))
                    // Show max participants or current as speakers (simplified)
                    val speakers = if (room.maxParticipants != null) {
                        minOf(room.currentParticipants, room.maxParticipants)
                    } else {
                        room.currentParticipants
                    }
                    Text(
                        text = speakers.toString(),
                        modifier = Modifier.padding(end = 3.dp)
                    )
                    Image(
                        painter = painterResource(id = R.drawable.chat_gray_icon),
                        contentDescription = "Speakers",
                        modifier = Modifier.size(13.dp)
                    )
                }
            }
        }
    }
}
