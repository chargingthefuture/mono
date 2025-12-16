package com.chyme.android.ui.viewmodel

import com.chyme.android.auth.OTPAuthManager
import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.api.ApiService
import com.chyme.android.data.model.User
import com.chyme.android.data.model.ValidateOTPRequest
import com.chyme.android.data.model.ValidateOTPResponse
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.verify
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import retrofit2.Response

class AuthViewModelTest {
    private lateinit var authManager: OTPAuthManager
    private lateinit var apiService: ApiService
    private lateinit var viewModel: AuthViewModel
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        authManager = mockk(relaxed = true)
        apiService = mockk(relaxed = true)
        
        // Mock ApiClient
        mockkObject(ApiClient)
        every { ApiClient.apiService } returns apiService
        
        // Setup default mock behaviors
        every { authManager.isSignedIn } returns MutableStateFlow(false)
        every { authManager.user } returns MutableStateFlow(null)
        every { authManager.needsApproval() } returns false
        every { authManager.isAdmin() } returns false
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state should have null user and not loading`() = runTest(testDispatcher) {
        viewModel = AuthViewModel(authManager)
        advanceUntilIdle()
        
        assertNull(viewModel.user.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `loadUser should update user on successful response`() = runTest(testDispatcher) {
        val mockUser = User(
            id = "user1",
            email = "test@example.com",
            firstName = "Test",
            lastName = "User",
            profileImageUrl = null,
            quoraProfileUrl = null,
            isAdmin = false,
            isVerified = true,
            isApproved = true
        )
        
        coEvery { apiService.getCurrentUser() } returns Response.success(mockUser)
        
        viewModel = AuthViewModel(authManager)
        advanceUntilIdle()
        
        viewModel.loadUser()
        advanceUntilIdle()
        
        assertEquals(mockUser, viewModel.user.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `loadUser should set error on failed response`() = runTest(testDispatcher) {
        val errorResponse = mockk<retrofit2.Response<User>>(relaxed = true)
        coEvery { apiService.getCurrentUser() } returns errorResponse
        every { errorResponse.isSuccessful } returns false
        every { errorResponse.code() } returns 404
        
        viewModel = AuthViewModel(authManager)
        advanceUntilIdle()
        
        viewModel.loadUser()
        advanceUntilIdle()
        
        assertNull(viewModel.user.value)
        assertEquals("Failed to load user", viewModel.error.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `loadUser should set error on exception`() = runTest(testDispatcher) {
        val exceptionMessage = "Network error"
        coEvery { apiService.getCurrentUser() } throws Exception(exceptionMessage)
        
        viewModel = AuthViewModel(authManager)
        advanceUntilIdle()
        
        viewModel.loadUser()
        advanceUntilIdle()
        
        assertEquals(exceptionMessage, viewModel.error.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `signInWithOTP should save token and update user on success`() = runTest(testDispatcher) {
        val otp = "123456"
        val mockUser = User(
            id = "user1",
            email = "test@example.com",
            firstName = "Test",
            lastName = "User",
            profileImageUrl = null,
            quoraProfileUrl = null,
            isAdmin = false,
            isVerified = true,
            isApproved = true
        )
        val mockResponse = ValidateOTPResponse(token = "test-token", user = mockUser)
        
        coEvery { apiService.validateOTP(any()) } returns Response.success(mockResponse)
        every { authManager.saveAuthToken(any(), any()) } returns Unit
        every { authManager.updateUser(any()) } returns Unit
        
        viewModel = AuthViewModel(authManager)
        viewModel.signInWithOTP(otp)
        advanceUntilIdle()
        
        verify { authManager.saveAuthToken("test-token", "user1") }
        verify { authManager.updateUser(mockUser) }
        assertEquals(mockUser, viewModel.user.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `signInWithOTP should set error on invalid OTP`() = runTest(testDispatcher) {
        val otp = "invalid"
        val errorResponse = mockk<retrofit2.Response<ValidateOTPResponse>>(relaxed = true)
        coEvery { apiService.validateOTP(any()) } returns errorResponse
        every { errorResponse.isSuccessful } returns false
        every { errorResponse.code() } returns 401
        
        viewModel = AuthViewModel(authManager)
        viewModel.signInWithOTP(otp)
        advanceUntilIdle()
        
        assertEquals("Invalid OTP code. Please try again.", viewModel.error.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `signInWithOTP should set error on exception`() = runTest(testDispatcher) {
        val otp = "123456"
        val exceptionMessage = "Network error"
        coEvery { apiService.validateOTP(any()) } throws Exception(exceptionMessage)
        
        viewModel = AuthViewModel(authManager)
        viewModel.signInWithOTP(otp)
        advanceUntilIdle()
        
        assertEquals(exceptionMessage, viewModel.error.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `updateQuoraProfileUrl should update user on success`() = runTest(testDispatcher) {
        val url = "https://quora.com/profile/test"
        val mockUser = User(
            id = "user1",
            email = "test@example.com",
            firstName = "Test",
            lastName = "User",
            profileImageUrl = null,
            quoraProfileUrl = url,
            isAdmin = false,
            isVerified = true,
            isApproved = true
        )
        
        coEvery { apiService.updateQuoraProfileUrl(any()) } returns Response.success(mockUser)
        
        viewModel = AuthViewModel(authManager)
        viewModel.updateQuoraProfileUrl(url)
        advanceUntilIdle()
        
        assertEquals(mockUser, viewModel.user.value)
        assertEquals(url, viewModel.user.value?.quoraProfileUrl)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `updateQuoraProfileUrl should set error on failure`() = runTest(testDispatcher) {
        val url = "https://quora.com/profile/test"
        val errorResponse = mockk<retrofit2.Response<User>>(relaxed = true)
        coEvery { apiService.updateQuoraProfileUrl(any()) } returns errorResponse
        every { errorResponse.isSuccessful } returns false
        every { errorResponse.code() } returns 400
        
        viewModel = AuthViewModel(authManager)
        viewModel.updateQuoraProfileUrl(url)
        advanceUntilIdle()
        
        assertEquals("Failed to update Quora profile URL", viewModel.error.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `signOut should clear user and call authManager signOut`() = runTest(testDispatcher) {
        every { authManager.signOut() } returns Unit
        
        viewModel = AuthViewModel(authManager)
        viewModel.signOut()
        advanceUntilIdle()
        
        verify { authManager.signOut() }
        assertNull(viewModel.user.value)
    }

    @Test
    fun `isLoading should be true during API call`() = runTest(testDispatcher) {
        var isLoadingDuringCall = false
        coEvery { apiService.getCurrentUser() } coAnswers {
            // Check that loading is true during the call
            isLoadingDuringCall = viewModel.isLoading.value
            Response.success(mockk())
        }
        
        viewModel = AuthViewModel(authManager)
        advanceUntilIdle()
        
        viewModel.loadUser()
        // Advance just enough to start the coroutine and set loading to true
        testDispatcher.scheduler.advanceTimeBy(1)
        advanceUntilIdle()
        
        assertTrue("isLoading should be true during API call", isLoadingDuringCall)
        assertFalse(viewModel.isLoading.value)
    }
}

