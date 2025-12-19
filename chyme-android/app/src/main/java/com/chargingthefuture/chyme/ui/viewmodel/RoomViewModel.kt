package com.chargingthefuture.chyme.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.data.model.ChymeRoomParticipant
import com.chargingthefuture.chyme.data.model.ParticipantRole
import com.chargingthefuture.chyme.data.model.UpdateParticipantRequest
import com.chargingthefuture.chyme.data.repository.RoomRepository
import com.chargingthefuture.chyme.data.repository.WebRTCRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RoomUiState(
    val isLoading: Boolean = false,
    val room: ChymeRoom? = null,
    val participants: List<ChymeRoomParticipant> = emptyList(),
    val speakers: List<ChymeRoomParticipant> = emptyList(),
    val listeners: List<ChymeRoomParticipant> = emptyList(),
    val isJoined: Boolean = false,
    val isMuted: Boolean = false,
    val hasRaisedHand: Boolean = false,
    val currentUserRole: ParticipantRole? = null,
    val errorMessage: String? = null
)

@HiltViewModel
class RoomViewModel @Inject constructor(
    application: Application,
    private val roomRepository: RoomRepository,
    private val webRTCRepository: WebRTCRepository
) : AndroidViewModel(application) {
    
    private val _uiState = MutableStateFlow(RoomUiState())
    val uiState: StateFlow<RoomUiState> = _uiState.asStateFlow()
    
    init {
        webRTCRepository.initialize()
    }
    
    fun loadRoom(roomId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            roomRepository.getRoom(roomId).fold(
                onSuccess = { room ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        room = room,
                        errorMessage = null
                    )
                    loadParticipants(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error.message ?: "Failed to load room"
                    )
                }
            )
        }
    }
    
    fun loadParticipants(roomId: String) {
        viewModelScope.launch {
            roomRepository.getRoomParticipants(roomId).fold(
                onSuccess = { participants ->
                    val speakers = participants.filter { it.role == ParticipantRole.SPEAKER || it.role == ParticipantRole.CREATOR }
                    val listeners = participants.filter { it.role == ParticipantRole.LISTENER }
                    
                    _uiState.value = _uiState.value.copy(
                        participants = participants,
                        speakers = speakers,
                        listeners = listeners
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to load participants"
                    )
                }
            )
        }
    }
    
    fun joinRoom(roomId: String) {
        viewModelScope.launch {
            roomRepository.joinRoom(roomId).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isJoined = true)
                    loadParticipants(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to join room"
                    )
                }
            )
        }
    }
    
    fun leaveRoom(roomId: String) {
        viewModelScope.launch {
            roomRepository.leaveRoom(roomId).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isJoined = false)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to leave room"
                    )
                }
            )
        }
    }
    
    fun raiseHand(roomId: String) {
        viewModelScope.launch {
            roomRepository.raiseHand(roomId).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(hasRaisedHand = true)
                    loadParticipants(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to raise hand"
                    )
                }
            )
        }
    }
    
    fun toggleMute() {
        val newMutedState = !_uiState.value.isMuted
        webRTCRepository.muteMicrophone(newMutedState)
        _uiState.value = _uiState.value.copy(isMuted = newMutedState)
    }
    
    fun promoteToSpeaker(roomId: String, userId: String) {
        viewModelScope.launch {
            val request = UpdateParticipantRequest(userId = userId, role = "speaker")
            roomRepository.updateParticipant(roomId, userId, request).fold(
                onSuccess = {
                    loadParticipants(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to promote user"
                    )
                }
            )
        }
    }
    
    fun muteParticipant(roomId: String, userId: String, muted: Boolean) {
        viewModelScope.launch {
            val request = UpdateParticipantRequest(userId = userId, isMuted = muted)
            roomRepository.updateParticipant(roomId, userId, request).fold(
                onSuccess = {
                    loadParticipants(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to mute participant"
                    )
                }
            )
        }
    }
    
    fun kickParticipant(roomId: String, userId: String) {
        viewModelScope.launch {
            roomRepository.kickParticipant(roomId, userId).fold(
                onSuccess = {
                    loadParticipants(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to kick participant"
                    )
                }
            )
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    override fun onCleared() {
        super.onCleared()
        webRTCRepository.cleanup()
    }
}


