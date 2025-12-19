package com.chargingthefuture.chyme.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chargingthefuture.chyme.data.api.ApiClient
import com.chargingthefuture.chyme.data.model.ChymeRoom
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

data class RoomListUiState(
    val isLoading: Boolean = false,
    val rooms: List<ChymeRoom> = emptyList(),
    val errorMessage: String? = null
)

class RoomListViewModel(application: Application) : AndroidViewModel(application) {
    private val _uiState = MutableStateFlow(RoomListUiState())
    val uiState: StateFlow<RoomListUiState> = _uiState.asStateFlow()
    
    init {
        loadRooms()
    }
    
    fun loadRooms(roomType: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                errorMessage = null
            )
            
            try {
                val response = ApiClient.apiService.getRooms(roomType)
                
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        rooms = response.body()!!,
                        errorMessage = null
                    )
                } else {
                    val errorMessage = when (response.code()) {
                        401 -> "Authentication required. Please sign in."
                        403 -> "Access denied"
                        else -> "Failed to load rooms: ${response.message()}"
                    }
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = errorMessage
                    )
                }
            } catch (e: HttpException) {
                val errorMessage = when (e.code()) {
                    401 -> "Authentication required. Please sign in."
                    403 -> "Access denied"
                    else -> "Server error: ${e.message()}"
                }
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = errorMessage
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Network error: ${e.message}"
                )
            }
        }
    }
    
    fun refresh() {
        loadRooms()
    }
}

