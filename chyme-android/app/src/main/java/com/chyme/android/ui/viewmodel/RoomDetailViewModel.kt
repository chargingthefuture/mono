package com.chyme.android.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.Message
import com.chyme.android.data.model.Room
import com.chyme.android.data.model.RoomParticipant
import com.chyme.android.data.model.SendMessageRequest
import io.sentry.Sentry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

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
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Failed to load room (code=$code, error=$errorBodyString, roomId=$roomId)"
                    Log.e("RoomDetailViewModel", detailedMessage)
                    Sentry.captureMessage("getRoom API failed: $detailedMessage")
                    _error.value = "Failed to load room"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }
                Log.e("RoomDetailViewModel", "Exception while loading room: $message", e)
                Sentry.captureException(e)
                _error.value = message
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
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Failed to load messages (code=$code, error=$errorBodyString, roomId=$roomId)"
                    Log.e("RoomDetailViewModel", detailedMessage)
                    Sentry.captureMessage("getMessages API failed: $detailedMessage")
                    _error.value = "Failed to load messages"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }
                Log.e("RoomDetailViewModel", "Exception while loading messages: $message", e)
                Sentry.captureException(e)
                _error.value = message
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
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Failed to send message (code=$code, error=$errorBodyString, roomId=$roomId)"
                    Log.e("RoomDetailViewModel", detailedMessage)
                    Sentry.captureMessage("sendMessage API failed: $detailedMessage")
                    _error.value = "Failed to send message"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }
                Log.e("RoomDetailViewModel", "Exception while sending message: $message", e)
                Sentry.captureException(e)
                _error.value = message
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
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Failed to join room (code=$code, error=$errorBodyString, roomId=$roomId)"
                    Log.e("RoomDetailViewModel", detailedMessage)
                    Sentry.captureMessage("joinRoom API failed: $detailedMessage")
                    _error.value = "Failed to join room"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }
                Log.e("RoomDetailViewModel", "Exception while joining room: $message", e)
                Sentry.captureException(e)
                _error.value = message
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
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }
                    val detailedMessage = "Failed to leave room (code=$code, error=$errorBodyString, roomId=$roomId)"
                    Log.e("RoomDetailViewModel", detailedMessage)
                    Sentry.captureMessage("leaveRoom API failed: $detailedMessage")
                    _error.value = "Failed to leave room"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }
                Log.e("RoomDetailViewModel", "Exception while leaving room: $message", e)
                Sentry.captureException(e)
                _error.value = message
            }
        }
    }
    
    fun loadParticipants() {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.getParticipants(roomId)
                if (response.isSuccessful) {
                    _participants.value = response.body() ?: emptyList()
                } else {
                    // Log but don't set error - participants are optional
                    val code = response.code()
                    Log.w("RoomDetailViewModel", "Failed to load participants (code=$code, roomId=$roomId)")
                }
            } catch (e: Exception) {
                // Log but don't set error - participants are optional
                Log.w("RoomDetailViewModel", "Exception while loading participants: ${e.message}", e)
                Sentry.captureException(e)
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

