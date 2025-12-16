package com.chyme.android.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.Room
import io.sentry.Sentry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

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

            Log.d("RoomListViewModel", "loadRooms called with roomType=$roomType")

            try {
                val response = ApiClient.apiService.getRooms(roomType)

                if (response.isSuccessful) {
                    val rooms = response.body() ?: emptyList()
                    Log.d(
                        "RoomListViewModel",
                        "loadRooms success: status=${response.code()}, count=${rooms.size}"
                    )
                    _rooms.value = rooms
                } else {
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }

                    val detailedMessage =
                        "Failed to load rooms (code=$code, error=$errorBodyString, roomType=$roomType)"

                    Log.e("RoomListViewModel", detailedMessage)
                    Sentry.captureMessage("getRooms API failed: $detailedMessage")

                    _error.value = "Failed to load rooms"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }

                Log.e("RoomListViewModel", "Exception while loading rooms: $message", e)
                Sentry.captureException(e)

                _error.value = message
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun setFilter(type: String?) {
        Log.d("RoomListViewModel", "setFilter called with type=$type")
        _filterType.value = type
        loadRooms(type)
    }
    
    fun refresh() {
        Log.d("RoomListViewModel", "refresh called with filterType=${_filterType.value}")
        loadRooms(_filterType.value)
    }
}

