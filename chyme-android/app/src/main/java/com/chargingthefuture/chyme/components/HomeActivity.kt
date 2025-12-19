package com.chargingthefuture.chyme.components

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.constraintlayout.compose.ConstraintLayout
import androidx.lifecycle.viewmodel.compose.viewModel
import com.chargingthefuture.chyme.R
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.ui.theme.ChymeTheme
import com.chargingthefuture.chyme.ui.viewmodel.RoomListViewModel

class HomeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ChymeTheme {
                homeScreen()
            }
        }
    }
}

@Composable
fun homeScreen() {
    val viewModel: RoomListViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    Surface(color = MaterialTheme.colors.surface) {
        ConstraintLayout(modifier = Modifier.fillMaxSize()) {
            val (searchButton, invitesButton, calendarButton, notificationButton, profileButton, roomList) = createRefs()

            // Search Icon
            IconButton(
                onClick = { /* doSomething() */ },
                modifier = Modifier.constrainAs(searchButton) {
                    top.linkTo(parent.top, margin = 25.dp)
                    start.linkTo(parent.start, margin = 5.dp)
                    end.linkTo(invitesButton.start, margin = 10.dp)
                }
            ) {
                Image(
                    painter = painterResource(id = R.drawable.search_icon),
                    contentDescription = "search icon",
                    modifier = Modifier
                        .height(27.dp)
                        .width(27.dp),
                )
            }

            // Invites Icon
            IconButton(
                onClick = { /* doSomething() */ },
                modifier = Modifier.constrainAs(invitesButton) {
                    top.linkTo(parent.top, 25.dp)
                    start.linkTo(searchButton.end, 68.dp)
                    end.linkTo(calendarButton.start, 12.dp)
                }
            ) {
                Image(
                    painter = painterResource(id = R.drawable.invites_icon),
                    contentDescription = null,
                    modifier = Modifier
                        .height(35.dp)
                        .width(35.dp)
                        .fillMaxSize(),
                    contentScale = ContentScale.FillBounds
                )
            }

            // Calendar Icon
            IconButton(
                onClick = { /* doSomething() */ },
                modifier = Modifier.constrainAs(calendarButton) {
                    top.linkTo(parent.top, 25.dp)
                    start.linkTo(invitesButton.end)
                    end.linkTo(notificationButton.end, 12.dp)
                }
            ) {
                Image(
                    painter = painterResource(id = R.drawable.calendar_icon),
                    contentDescription = null,
                    modifier = Modifier
                        .height(27.dp)
                        .width(27.dp)
                        .fillMaxSize(),
                    contentScale = ContentScale.FillBounds
                )
            }

            // Notification Icon
            IconButton(
                onClick = { /* doSomething() */ },
                modifier = Modifier.constrainAs(notificationButton) {
                    top.linkTo(parent.top, 25.dp)
                    start.linkTo(calendarButton.end)
                    end.linkTo(profileButton.start)
                }
            ) {
                Image(
                    painter = painterResource(id = R.drawable.notification_icon),
                    contentDescription = null,
                    modifier = Modifier
                        .height(35.dp)
                        .width(35.dp)
                        .fillMaxSize(),
                    contentScale = ContentScale.FillBounds
                )
            }

            // Profile Icon
            IconButton(
                onClick = { /* doSomething() */ },
                modifier = Modifier.constrainAs(profileButton) {
                    top.linkTo(parent.top, 25.dp)
                    start.linkTo(calendarButton.end)
                    end.linkTo(parent.end)
                }
            ) {
                Image(
                    painter = painterResource(id = R.drawable.profile_rectangle),
                    contentDescription = null,
                    modifier = Modifier
                        .height(27.dp)
                        .width(27.dp),
                    contentScale = ContentScale.FillBounds
                )
            }
            
            // Room List
            Box(
                modifier = Modifier
                    .constrainAs(roomList) {
                        top.linkTo(searchButton.bottom, margin = 20.dp)
                        start.linkTo(parent.start)
                        end.linkTo(parent.end)
                        bottom.linkTo(parent.bottom)
                    }
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                } else if (uiState.errorMessage != null) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = uiState.errorMessage!!,
                            color = MaterialTheme.colors.error,
                            modifier = Modifier.padding(16.dp)
                        )
                        Button(onClick = { viewModel.refresh() }) {
                            Text("Retry")
                        }
                    }
                } else {
                    RoomList(rooms = uiState.rooms)
                }
            }
        }
    }
}

@Composable
fun RoomList(rooms: List<ChymeRoom>) {
    val scrollState = rememberLazyListState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(top = 100.dp, start = 20.dp, end = 20.dp, bottom = 20.dp),
        state = scrollState
    ) {
        items(rooms) { room ->
            RoomCard(room)
        }
    }
}
