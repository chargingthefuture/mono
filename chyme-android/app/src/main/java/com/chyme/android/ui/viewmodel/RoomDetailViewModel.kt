package com.chyme.android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.Message
import com.chyme.android.data.model.Room
import com.chyme.android.data.model.RoomParticipant
import com.chyme.android.data.model.SendMessageRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RoomDetailViewModel(private val roomId: String) : ViewModel() {
    private val _room = MutableStateFlow<Room?>(null)
    val room: StateFlow<Room?> = _room.asStateFlow()
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    
    private val _participants = MutableStateFlow<List<RoomParticipant>>(emptyList())
    val participants: StateFlow<List<RoomParticipant>> = _participants.asStateFlow()
    
    private val _isJoined = MutableStateFlow(false)
    val isJoined: StateFlow<Boolean> = _isJoined.asStateFlow()
    
    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    init {
        loadRoom()
        loadMessages()
    }
    
    fun loadRoom() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = ApiClient.apiService.getRoom(roomId)
                if (response.isSuccessful) {
                    _room.value = response.body()
                } else {
                    _error.value = "Failed to load room"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun loadMessages() {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.getMessages(roomId)
                if (response.isSuccessful) {
                    _messages.value = response.body() ?: emptyList()
                } else {
                    _error.value = "Failed to load messages"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            }
        }
    }
    
    fun sendMessage(content: String) {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.sendMessage(
                    roomId,
                    SendMessageRequest(content)
                )
                if (response.isSuccessful) {
                    loadMessages() // Refresh messages
                } else {
                    _error.value = "Failed to send message"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            }
        }
    }
    
    fun joinRoom() {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.joinRoom(roomId)
                if (response.isSuccessful) {
                    _isJoined.value = true
                    loadParticipants()
                } else {
                    _error.value = "Failed to join room"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            }
        }
    }
    
    fun leaveRoom() {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.leaveRoom(roomId)
                if (response.isSuccessful) {
                    _isJoined.value = false
                    _isSpeaking.value = false
                } else {
                    _error.value = "Failed to leave room"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            }
        }
    }
    
    fun loadParticipants() {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.getParticipants(roomId)
                if (response.isSuccessful) {
                    _participants.value = response.body() ?: emptyList()
                }
            } catch (e: Exception) {
                // Silently fail - participants are optional
            }
        }
    }
    
    fun toggleSpeaking() {
        // Note: Speaking status is managed locally for now
        // In a real implementation, this would update the participant record
        // For now, we'll just toggle the local state
        _isSpeaking.value = !_isSpeaking.value
    }
    
    fun refresh() {
        loadRoom()
        loadMessages()
    }
}

