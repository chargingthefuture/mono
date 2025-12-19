package com.chargingthefuture.chyme.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chargingthefuture.chyme.data.model.ChymeRoom
import com.chargingthefuture.chyme.data.repository.RoomRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = false,
    val rooms: List<ChymeRoom> = emptyList(),
    val filteredRooms: List<ChymeRoom> = emptyList(),
    val searchQuery: String = "",
    val selectedRoomType: String? = null,
    val errorMessage: String? = null,
    val hasStaleData: Boolean = false
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    application: Application,
    private val roomRepository: RoomRepository
) : AndroidViewModel(application) {
    
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    
    init {
        loadRooms()
    }
    
    fun loadRooms(roomType: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                errorMessage = null,
                selectedRoomType = roomType
            )
            
            roomRepository.getRooms(roomType).fold(
                onSuccess = { rooms ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        rooms = rooms,
                        filteredRooms = filterRooms(rooms, _uiState.value.searchQuery),
                        errorMessage = null,
                        hasStaleData = false
                    )
                },
                onFailure = { error ->
                    val hasExisting = _uiState.value.rooms.isNotEmpty()
                    _uiState.value = if (hasExisting) {
                        _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to refresh rooms (showing last known list)",
                            hasStaleData = true
                        )
                    } else {
                        _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to load rooms",
                            hasStaleData = false
                        )
                    }
                }
            )
        }
    }
    
    fun searchRooms(query: String) {
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredRooms = filterRooms(_uiState.value.rooms, query)
        )
    }
    
    private fun filterRooms(rooms: List<ChymeRoom>, query: String): List<ChymeRoom> {
        if (query.isBlank()) return rooms
        val lowerQuery = query.lowercase()
        return rooms.filter { room ->
            room.name.lowercase().contains(lowerQuery) ||
            room.description?.lowercase()?.contains(lowerQuery) == true ||
            room.topic?.lowercase()?.contains(lowerQuery) == true
        }
    }
    
    fun refresh() {
        loadRooms(_uiState.value.selectedRoomType)
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}


