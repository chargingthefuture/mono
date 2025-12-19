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
import com.chargingthefuture.chyme.signaling.SignalingClient
import com.chargingthefuture.chyme.signaling.SignalingConnectionState
import dagger.hilt.android.lifecycle.HiltViewModel
import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import org.json.JSONObject
import com.chargingthefuture.chyme.data.model.ChymeMessage
import javax.inject.Inject

enum class WebRTCConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    RECONNECTING,
    FAILED
}

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
    val chatErrorMessage: String? = null,
    val webRTCConnectionState: WebRTCConnectionState = WebRTCConnectionState.DISCONNECTED,
    val webRTCConnectionError: String? = null,
    val isOnline: Boolean = true,
    val isSendingMessage: Boolean = false,
    val pendingMessages: List<String> = emptyList()
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
    private var chatSignalingClient: SignalingClient? = null
    private var currentRoomId: String? = null
    private val maxMessages = 500 // Trim to last 500 messages
    private val messageQueue = mutableListOf<Pair<String, String>>() // roomId to content
    
    init {
        // Observe WebRTC connection state changes
        viewModelScope.launch {
            webRTCManager?.connectionState?.collect { state ->
                _uiState.value = _uiState.value.copy(webRTCConnectionState = state)
            }
        }
        
        viewModelScope.launch {
            webRTCManager?.connectionError?.collect { error ->
                _uiState.value = _uiState.value.copy(webRTCConnectionError = error)
            }
        }
    }
    
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
        
        // Monitor network connectivity
        setupNetworkMonitoring()
    }
    
    private fun setupNetworkMonitoring() {
        val context = getApplication<Application>()
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                _uiState.value = _uiState.value.copy(isOnline = true)
                // Process queued messages when back online
                processMessageQueue()
            }
            
            override fun onLost(network: Network) {
                _uiState.value = _uiState.value.copy(isOnline = false)
            }
            
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                val hasInternet = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                        networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
                _uiState.value = _uiState.value.copy(isOnline = hasInternet)
                if (hasInternet) {
                    processMessageQueue()
                }
            }
        }
        
        connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
        
        // Check initial state
        val activeNetwork = connectivityManager.activeNetwork
        val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork)
        val isOnline = capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true &&
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        _uiState.value = _uiState.value.copy(isOnline = isOnline)
    }
    
    private fun processMessageQueue() {
        val roomId = currentRoomId ?: return
        if (!_uiState.value.isOnline) return
        
        viewModelScope.launch {
            val queue = messageQueue.toList()
            messageQueue.clear()
            
            for ((queuedRoomId, content) in queue) {
                if (queuedRoomId == roomId) {
                    sendMessageWithRetry(queuedRoomId, content, isAnonymous = true)
                }
            }
        }
    }
    
    private fun observeWebRTCState(manager: WebRTCManager) {
        viewModelScope.launch {
            manager.connectionState.collect { state ->
                _uiState.value = _uiState.value.copy(webRTCConnectionState = state)
            }
        }
        
        viewModelScope.launch {
            manager.connectionError.collect { error ->
                _uiState.value = _uiState.value.copy(webRTCConnectionError = error)
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
                    // Trim messages to prevent unbounded growth
                    val trimmedMessages = if (messages.size > maxMessages) {
                        messages.takeLast(maxMessages)
                    } else {
                        messages
                    }
                    
                    _uiState.value = _uiState.value.copy(
                        messages = trimmedMessages,
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
    
    fun addMessageFromWebSocket(message: ChymeMessage) {
        val currentMessages = _uiState.value.messages
        // Check if message already exists (avoid duplicates)
        if (currentMessages.any { it.id == message.id }) {
            return
        }
        
        val updatedMessages = (currentMessages + message)
            .sortedBy { it.createdAt }
            .let { if (it.size > maxMessages) it.takeLast(maxMessages) else it }
        
        _uiState.value = _uiState.value.copy(messages = updatedMessages)
    }
    
    fun joinRoom(roomId: String) {
        viewModelScope.launch {
            roomRepository.joinRoom(roomId).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isJoined = true)
                    currentRoomId = roomId
                    loadParticipants(roomId)
                    maybeUpdateWebRTC(roomId)
                    setupChatWebSocket(roomId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = error.message ?: "Failed to join room"
                    )
                }
            )
        }
    }
    
    private fun setupChatWebSocket(roomId: String) {
        viewModelScope.launch {
            val token = authManager.getAuthToken() ?: return@launch
            val userId = _uiState.value.currentUserId
            
            // Create signaling client for chat (separate from WebRTC signaling)
            val client = SignalingClient(
                roomId = roomId,
                authToken = token,
                userId = userId,
                endpointUrl = "wss://app.chargingthefuture.com/api/chyme/signaling",
                scope = viewModelScope
            )
            
            chatSignalingClient = client
            
            // Observe WebSocket messages for chat
            viewModelScope.launch {
                client.events.collectLatest { raw ->
                    try {
                        val json = org.json.JSONObject(raw)
                        if (json.optString("type") == "chat-message" && json.optString("roomId") == roomId) {
                            val message = com.chargingthefuture.chyme.data.model.ChymeMessage(
                                id = json.optString("id", ""),
                                roomId = json.optString("roomId", ""),
                                userId = json.optString("userId", ""),
                                content = json.optString("content", ""),
                                isAnonymous = json.optBoolean("isAnonymous", true),
                                createdAt = json.optString("createdAt", "")
                            )
                            addMessageFromWebSocket(message)
                        }
                    } catch (e: Exception) {
                        // Failed to parse message, ignore
                    }
                }
            }
            
            client.connect()
        }
    }
    
    fun leaveRoom(roomId: String) {
        viewModelScope.launch {
            roomRepository.leaveRoom(roomId).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isJoined = false)
                    currentRoomId = null
                    webRTCManager?.stop()
                    webRTCManager = null
                    chatSignalingClient?.close()
                    chatSignalingClient = null
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
        
        currentRoomId = roomId
        
        // If offline, queue the message
        if (!_uiState.value.isOnline) {
            messageQueue.add(roomId to content.trim())
            _uiState.value = _uiState.value.copy(
                chatErrorMessage = "Offline. Message will be sent when connection is restored.",
                pendingMessages = messageQueue.map { it.second }
            )
            return
        }
        
        sendMessageWithRetry(roomId, content.trim(), isAnonymous)
    }
    
    private suspend fun sendMessageWithRetry(
        roomId: String,
        content: String,
        isAnonymous: Boolean = true,
        maxRetries: Int = 3
    ) {
        _uiState.value = _uiState.value.copy(isSendingMessage = true)
        
        var attempt = 0
        var lastError: Exception? = null
        
        while (attempt < maxRetries) {
            val result = roomRepository.sendMessage(roomId, content, isAnonymous)
            
            result.fold(
                onSuccess = { message ->
                    // Optimistically add message to UI (will also come via WebSocket)
                    val currentMessages = _uiState.value.messages
                    if (!currentMessages.any { it.id == message.id }) {
                        val updatedMessages = (currentMessages + message)
                            .sortedBy { it.createdAt }
                            .let { if (it.size > maxMessages) it.takeLast(maxMessages) else it }
                        
                        _uiState.value = _uiState.value.copy(
                            messages = updatedMessages,
                            chatErrorMessage = null,
                            isSendingMessage = false
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(
                            chatErrorMessage = null,
                            isSendingMessage = false
                        )
                    }
                    return
                },
                onFailure = { error ->
                    lastError = error
                    attempt++
                    
                    if (attempt < maxRetries) {
                        // Exponential backoff: 1s, 2s, 4s
                        val backoffMs = (1 shl (attempt - 1)) * 1000L
                        delay(backoffMs)
                    }
                }
            )
        }
        
        // All retries failed
        _uiState.value = _uiState.value.copy(
            chatErrorMessage = lastError?.message ?: "Failed to send message after $maxRetries attempts",
            isSendingMessage = false
        )
        
        // Queue message for retry when connection is restored
        if (!_uiState.value.isOnline) {
            messageQueue.add(roomId to content)
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
            if (webRTCManager != null) {
                webRTCManager?.stop()
                webRTCManager = null
                _uiState.value = _uiState.value.copy(
                    webRTCConnectionState = WebRTCConnectionState.DISCONNECTED,
                    webRTCConnectionError = null
                )
            }
            return
        }

        // Role changed from listener to speaker/creator - start WebRTC
        // Or if WebRTC is not running and user is a speaker/creator, start it
        if (webRTCManager == null) {
            // Start WebRTC for creator/speaker
            viewModelScope.launch {
                val token = authManager.getAuthToken() ?: return@launch
                val isCaller = role == ParticipantRole.CREATOR || role == ParticipantRole.SPEAKER
                val manager = WebRTCManager(
                    roomId = roomId,
                    currentUserId = currentUserId,
                    webRtcRepo = webRTCRepository,
                    signalingEndpoint = "wss://app.chargingthefuture.com/api/chyme/signaling",
                    authToken = token,
                    isCaller = isCaller
                )
                webRTCManager = manager
                observeWebRTCState(manager)
                
                // Set up chat message handler from WebSocket
                manager.onChatMessageReceived = { json ->
                    try {
                        val message = com.chargingthefuture.chyme.data.model.ChymeMessage(
                            id = json.optString("id", ""),
                            roomId = json.optString("roomId", ""),
                            userId = json.optString("userId", ""),
                            content = json.optString("content", ""),
                            isAnonymous = json.optBoolean("isAnonymous", true),
                            createdAt = json.optString("createdAt", "")
                        )
                        addMessageFromWebSocket(message)
                    } catch (e: Exception) {
                        // Failed to parse chat message, ignore
                    }
                }
                
                manager.start()
                
                // Update peers with current speakers
                updateWebRTCPeers()
            }
        } else {
            // WebRTC is already running - update peer list based on current participants
            updateWebRTCPeers()
        }
    }
    
    /**
     * Update WebRTC peer connections based on current speakers in the room.
     * This should be called whenever the participants list changes.
     */
    private fun updateWebRTCPeers() {
        val manager = webRTCManager ?: return
        val speakers = _uiState.value.speakers
        val speakerUserIds = speakers.map { it.userId }
        manager.updatePeers(speakerUserIds)
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


