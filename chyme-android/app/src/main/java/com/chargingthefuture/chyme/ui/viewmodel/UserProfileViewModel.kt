package com.chargingthefuture.chyme.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chargingthefuture.chyme.data.model.ChymeUser
import com.chargingthefuture.chyme.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class UserProfileUiState(
    val isLoading: Boolean = false,
    val user: ChymeUser? = null,
    val isFollowing: Boolean = false,
    val isBlocked: Boolean = false,
    val isLoadingFollowStatus: Boolean = false,
    val isLoadingBlockStatus: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class UserProfileViewModel @Inject constructor(
    application: Application,
    private val userRepository: UserRepository
) : AndroidViewModel(application) {
    
    private val _uiState = MutableStateFlow(UserProfileUiState())
    val uiState: StateFlow<UserProfileUiState> = _uiState.asStateFlow()
    
    fun loadUser(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            userRepository.getUser(userId).fold(
                onSuccess = { user ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        user = user,
                        errorMessage = null
                    )
                    // Load follow and block status
                    loadFollowStatus(userId)
                    loadBlockStatus(userId)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error.message ?: "Failed to load user"
                    )
                }
            )
        }
    }
    
    private fun loadFollowStatus(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingFollowStatus = true)
            userRepository.getFollowStatus(userId).fold(
                onSuccess = { isFollowing ->
                    _uiState.value = _uiState.value.copy(
                        isFollowing = isFollowing,
                        isLoadingFollowStatus = false
                    )
                },
                onFailure = {
                    _uiState.value = _uiState.value.copy(isLoadingFollowStatus = false)
                }
            )
        }
    }
    
    private fun loadBlockStatus(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingBlockStatus = true)
            userRepository.getBlockStatus(userId).fold(
                onSuccess = { isBlocked ->
                    _uiState.value = _uiState.value.copy(
                        isBlocked = isBlocked,
                        isLoadingBlockStatus = false
                    )
                },
                onFailure = {
                    _uiState.value = _uiState.value.copy(isLoadingBlockStatus = false)
                }
            )
        }
    }
    
    fun toggleFollow(userId: String) {
        viewModelScope.launch {
            val currentFollowing = _uiState.value.isFollowing
            _uiState.value = _uiState.value.copy(isFollowing = !currentFollowing) // Optimistic update
            
            val result = if (currentFollowing) {
                userRepository.unfollowUser(userId)
            } else {
                userRepository.followUser(userId)
            }
            
            result.fold(
                onSuccess = {
                    // Success - state already updated optimistically
                },
                onFailure = { error ->
                    // Revert optimistic update
                    _uiState.value = _uiState.value.copy(
                        isFollowing = currentFollowing,
                        errorMessage = error.message ?: "Failed to ${if (currentFollowing) "unfollow" else "follow"} user"
                    )
                }
            )
        }
    }
    
    fun toggleBlock(userId: String) {
        viewModelScope.launch {
            val currentBlocked = _uiState.value.isBlocked
            _uiState.value = _uiState.value.copy(isBlocked = !currentBlocked) // Optimistic update
            
            val result = userRepository.blockUser(userId)
            
            result.fold(
                onSuccess = {
                    // Success - state already updated optimistically
                    // If blocking, also unfollow
                    if (!currentBlocked && _uiState.value.isFollowing) {
                        userRepository.unfollowUser(userId).fold(
                            onSuccess = {
                                _uiState.value = _uiState.value.copy(isFollowing = false)
                            },
                            onFailure = {}
                        )
                    }
                },
                onFailure = { error ->
                    // Revert optimistic update
                    _uiState.value = _uiState.value.copy(
                        isBlocked = currentBlocked,
                        errorMessage = error.message ?: "Failed to ${if (currentBlocked) "unblock" else "block"} user"
                    )
                }
            )
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}

