package com.chyme.android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.Room
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RoomListViewModel : ViewModel() {
    private val _rooms = MutableStateFlow<List<Room>>(emptyList())
    val rooms: StateFlow<List<Room>> = _rooms.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _filterType = MutableStateFlow<String?>(null) // null = all, "public", "private"
    val filterType: StateFlow<String?> = _filterType.asStateFlow()
    
    fun loadRooms(roomType: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = ApiClient.apiService.getRooms(roomType)
                if (response.isSuccessful) {
                    _rooms.value = response.body() ?: emptyList()
                } else {
                    _error.value = "Failed to load rooms"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Unknown error"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun setFilter(type: String?) {
        _filterType.value = type
        loadRooms(type)
    }
    
    fun refresh() {
        loadRooms(_filterType.value)
    }
}

