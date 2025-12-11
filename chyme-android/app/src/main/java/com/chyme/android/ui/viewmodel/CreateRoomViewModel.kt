package com.chyme.android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.CreateRoomRequest
import com.chyme.android.data.model.Room
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CreateRoomViewModel : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _createdRoom = MutableStateFlow<Room?>(null)
    val createdRoom: StateFlow<Room?> = _createdRoom.asStateFlow()
    
    fun createRoom(
        name: String,
        description: String?,
        roomType: String,
        maxParticipants: Int?
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val request = CreateRoomRequest(
                    name = name,
                    description = description,
                    roomType = roomType,
                    maxParticipants = maxParticipants
                )
                val response = ApiClient.apiService.createRoom(request)
                if (response.isSuccessful) {
                    _createdRoom.value = response.body()
                } else {
                    _error.value = "Failed to create room"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun clearCreatedRoom() {
        _createdRoom.value = null
    }
}

