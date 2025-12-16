package com.roshadgu.treehouse.components

data class Room(
    val id: Int,
    val room_title: String,
    val description: String,
    val num_listeners: Int,
    val num_speakers: Int,
    val imageRes: Int
)
