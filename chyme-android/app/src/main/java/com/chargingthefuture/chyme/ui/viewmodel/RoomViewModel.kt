package com.chargingthefuture.chyme.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chargingthefuture.chyme.auth.MobileAuthManager
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.data.model.ChymeRoomParticipant
import com.chargingthefuture.chyme.data.model.ParticipantRole
import com.chargingthefuture.chyme.data.model.UpdateParticipantRequest
import com.chargingthefuture.chyme.data.repository.RoomRepository
import com.chargingthefuture.chyme.data.repository.WebRTCRepository
import com.chargingthefuture.chyme.webrtc.WebRTCManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import javax.inject.Inject

data class RoomUiState(
    val isLoading: Boolean = false,
    val room: ChymeRoom? = null,
    val participants: List<ChymeRoomParticipant> = emptyList(),
    val speakers: List<ChymeRoomParticipant> = emptyList(),
    val listeners: List<ChymeRoomParticipant> = emptyList(),
    val messages: List<ChymeMessage> = emptyList(),
    val isJoined: Boolean = false,
    val isMuted: Boolean = false,
    val hasRaisedHand: Boolean = false,
    val currentUserRole: ParticipantRole? = null,
    val currentUserId: String? = null,
    val errorMessage: String? = null,
    val chatErrorMessage: String? = null
)

@HiltViewModel
class RoomViewModel @Inject constructor(
    application: Application,
    private val roomRepository: RoomRepository,
    private val webRTCRepository: WebRTCRepository,
    private val authManager: MobileAuthManager
) : AndroidViewModel(application) {
    
    private val _uiState = MutableStateFlow(RoomUiState())
    val uiState: StateFlow<RoomUiState> = _uiState.asStateFlow()
    private var webRTCManager: WebRTCManager? = null
    
    init {
        webRTCRepository.initialize()
        // Load current user ID
        viewModelScope.launch {
            try {
                val userId = authManager.userId.first()
                _uiState.value = _uiState.value.copy(currentUserId = userId)
            } catch (e: Exception) {
                // User ID not available, that's okay
            }
        }
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
                    loadMessages(roomId)
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
                    
                    // Find current user's role
                    val currentUserId = _uiState.value.currentUserId
                    val currentUserParticipant = participants.find { it.userId == currentUserId }
                    val currentRole = currentUserParticipant?.role
                    
                    _uiState.value = _uiState.value.copy(
                        participants = participants,
                        speakers = speakers,
                        listeners = listeners,
                        currentUserRole = currentRole,
                        // Keep local state (mute/hand) in sync with server-side participant flags
                        hasRaisedHand = currentUserParticipant?.hasRaisedHand ?: _uiState.value.hasRaisedHand,
                        isMuted = currentUserParticipant?.isMuted ?: _uiState.value.isMuted
                    )
                    maybeUpdateWebRTC(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to load participants"
                    )
                }
            )
        }
    }

    fun loadMessages(roomId: String) {
        viewModelScope.launch {
            roomRepository.getRoomMessages(roomId).fold(
                onSuccess = { messages ->
                    _uiState.value = _uiState.value.copy(
                        messages = messages,
                        chatErrorMessage = null
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        chatErrorMessage = error.message ?: "Failed to load messages"
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
                    maybeUpdateWebRTC(roomId)
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
                    webRTCManager?.stop()
                    webRTCManager = null
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to leave room"
                    )
                }
            )
        }
    }
    
    fun endRoom(roomId: String) {
        viewModelScope.launch {
            roomRepository.endRoom(roomId).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        room = _uiState.value.room?.copy(isActive = false),
                        isJoined = false
                    )
                    webRTCManager?.stop()
                    webRTCManager = null
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to end room"
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

    fun sendMessage(roomId: String, content: String, isAnonymous: Boolean = true) {
        if (content.isBlank()) return

        viewModelScope.launch {
            roomRepository.sendMessage(roomId, content.trim(), isAnonymous).fold(
                onSuccess = { message ->
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + message,
                        chatErrorMessage = null
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        chatErrorMessage = error.message ?: "Failed to send message"
                    )
                }
            )
        }
    }

    fun updatePinnedLink(roomId: String, pinnedLink: String?) {
        viewModelScope.launch {
            roomRepository.updatePinnedLink(roomId, pinnedLink).fold(
                onSuccess = { updatedRoom ->
                    _uiState.value = _uiState.value.copy(
                        room = updatedRoom,
                        errorMessage = null
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to update pinned link"
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

    private fun maybeUpdateWebRTC(roomId: String) {
        val state = _uiState.value
        val role = state.currentUserRole
        val joined = state.isJoined
        val currentUserId = state.currentUserId

        // Stop WebRTC when not joined or not a speaker/creator
        if (!joined || role == null || role == ParticipantRole.LISTENER || currentUserId.isNullOrBlank()) {
            webRTCManager?.stop()
            webRTCManager = null
            return
        }

        // Already running and role is still active – nothing to change
        if (webRTCManager != null) return

        // Start WebRTC for creator/speaker
        viewModelScope.launch {
            val token = authManager.getAuthToken() ?: return@launch
            val isCaller = role == ParticipantRole.CREATOR
            val manager = WebRTCManager(
                roomId = roomId,
                currentUserId = currentUserId,
                webRtcRepo = webRTCRepository,
                signalingEndpoint = "wss://app.chargingthefuture.com/api/chyme/signaling",
                authToken = token,
                isCaller = isCaller
            )
            webRTCManager = manager
            manager.start()
        }
    }
    
    fun promoteToSpeaker(roomId: String, userId: String) {
        viewModelScope.launch {
            val request = UpdateParticipantRequest(userId = userId, role = "speaker")
            roomRepository.updateParticipant(roomId, userId, request).fold(
                onSuccess = {
                    loadParticipants(roomId)
                    maybeUpdateWebRTC(roomId)
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
                    maybeUpdateWebRTC(roomId)
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
                    maybeUpdateWebRTC(roomId)
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


