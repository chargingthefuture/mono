package com.chargingthefuture.chyme.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.data.model.CreateRoomRequest
import com.chargingthefuture.chyme.data.repository.RoomRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CreateRoomUiState(
    val isLoading: Boolean = false,
    val name: String = "",
    val description: String = "",
    val topic: String = "",
    val roomType: String = "public", // "public" or "private"
    val maxParticipants: Int = 100, // Default to 100 participants
    val createdRoom: ChymeRoom? = null,
    val errorMessage: String? = null
)

@HiltViewModel
class CreateRoomViewModel @Inject constructor(
    application: Application,
    private val roomRepository: RoomRepository
) : AndroidViewModel(application) {
    
    private val _uiState = MutableStateFlow(CreateRoomUiState())
    val uiState: StateFlow<CreateRoomUiState> = _uiState.asStateFlow()
    
    fun updateName(name: String) {
        _uiState.value = _uiState.value.copy(name = name)
    }
    
    fun updateDescription(description: String) {
        _uiState.value = _uiState.value.copy(description = description)
    }
    
    fun updateTopic(topic: String) {
        _uiState.value = _uiState.value.copy(topic = topic)
    }
    
    fun updateRoomType(roomType: String) {
        _uiState.value = _uiState.value.copy(roomType = roomType)
    }
    
    fun createRoom(onSuccess: (ChymeRoom) -> Unit) {
        if (_uiState.value.name.isBlank()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Room name is required"
            )
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            val request = CreateRoomRequest(
                name = _uiState.value.name,
                description = _uiState.value.description.takeIf { it.isNotBlank() },
                roomType = _uiState.value.roomType,
                topic = _uiState.value.topic.takeIf { it.isNotBlank() },
                maxParticipants = _uiState.value.maxParticipants // Always 100 by default
            )
            
            roomRepository.createRoom(request).fold(
                onSuccess = { room ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        createdRoom = room,
                        errorMessage = null
                    )
                    onSuccess(room)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error.message ?: "Failed to create room"
                    )
                }
            )
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    fun reset() {
        _uiState.value = CreateRoomUiState()
    }
}

