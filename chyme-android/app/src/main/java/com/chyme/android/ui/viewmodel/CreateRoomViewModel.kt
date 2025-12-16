package com.chyme.android.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.model.CreateRoomRequest
import com.chyme.android.data.model.Room
import io.sentry.Sentry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

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

            Log.d(
                "CreateRoomViewModel",
                "createRoom called with name=$name, description=$description, " +
                    "roomType=$roomType, maxParticipants=$maxParticipants"
            )

            try {
                val request = CreateRoomRequest(
                    name = name,
                    description = description,
                    roomType = roomType,
                    maxParticipants = maxParticipants
                )
                Log.d("CreateRoomViewModel", "Sending createRoom request: $request")

                val response = ApiClient.apiService.createRoom(request)

                if (response.isSuccessful) {
                    val body = response.body()
                    Log.d(
                        "CreateRoomViewModel",
                        "createRoom success: status=${response.code()}, body=$body"
                    )
                    _createdRoom.value = body
                } else {
                    val code = response.code()
                    val errorBodyString = try {
                        response.errorBody()?.string()
                    } catch (e: Exception) {
                        "unable to read error body: ${e.message}"
                    }

                    val detailedMessage =
                        "Failed to create room (code=$code, error=$errorBodyString)"

                    Log.e("CreateRoomViewModel", detailedMessage)

                    // Capture as non-fatal error in Sentry for remote debugging
                    Sentry.captureMessage(
                        "CreateRoom API failed: $detailedMessage"
                    )

                    _error.value = "Failed to create room"
                }
            } catch (e: Exception) {
                val message = when (e) {
                    is HttpException -> "HTTP ${e.code()} - ${e.message()}"
                    else -> e.message ?: "Unknown error"
                }

                Log.e("CreateRoomViewModel", "Exception while creating room: $message", e)
                Sentry.captureException(e)

                _error.value = message
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

