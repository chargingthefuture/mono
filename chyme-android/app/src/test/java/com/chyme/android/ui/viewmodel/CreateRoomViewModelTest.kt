package com.chyme.android.ui.viewmodel

import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.api.ApiService
import com.chyme.android.data.model.CreateRoomRequest
import com.chyme.android.data.model.Room
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.verify
import kotlinx.coroutines.Dispatchers
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

class CreateRoomViewModelTest {
    private lateinit var apiService: ApiService
    private lateinit var viewModel: CreateRoomViewModel
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        apiService = mockk(relaxed = true)
        
        // Mock ApiClient
        mockkObject(ApiClient)
        every { ApiClient.apiService } returns apiService
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state should have null created room and not loading`() = runTest(testDispatcher) {
        viewModel = CreateRoomViewModel()
        advanceUntilIdle()
        
        assertNull(viewModel.createdRoom.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `createRoom should update createdRoom on successful response`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomDescription = "Test Description"
        val roomType = "public"
        val maxParticipants = 10
        
        val mockRoom = Room(
            id = "room1",
            name = roomName,
            description = roomDescription,
            roomType = roomType,
            isActive = true,
            maxParticipants = maxParticipants,
            currentParticipants = 0,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        
        val successResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(any()) } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns mockRoom
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, roomDescription, roomType, maxParticipants)
        advanceUntilIdle()
        
        assertEquals(mockRoom, viewModel.createdRoom.value)
        assertEquals(roomName, viewModel.createdRoom.value?.name)
        assertEquals(roomDescription, viewModel.createdRoom.value?.description)
        assertEquals(roomType, viewModel.createdRoom.value?.roomType)
        assertEquals(maxParticipants, viewModel.createdRoom.value?.maxParticipants)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `createRoom should create request with correct parameters`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomDescription = "Test Description"
        val roomType = "private"
        val maxParticipants = 5
        
        val mockRoom = Room(
            id = "room1",
            name = roomName,
            description = roomDescription,
            roomType = roomType,
            isActive = true,
            maxParticipants = maxParticipants,
            currentParticipants = null,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        
        val capturedRequest = slot<CreateRoomRequest>()
        val successResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(capture(capturedRequest)) } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns mockRoom
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, roomDescription, roomType, maxParticipants)
        advanceUntilIdle()
        
        assertEquals(roomName, capturedRequest.captured.name)
        assertEquals(roomDescription, capturedRequest.captured.description)
        assertEquals(roomType, capturedRequest.captured.roomType)
        assertEquals(maxParticipants, capturedRequest.captured.maxParticipants)
    }

    @Test
    fun `createRoom should handle null description`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomType = "public"
        
        val mockRoom = Room(
            id = "room1",
            name = roomName,
            description = null,
            roomType = roomType,
            isActive = true,
            maxParticipants = null,
            currentParticipants = null,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        
        val successResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(any()) } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns mockRoom
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, null, roomType, null)
        advanceUntilIdle()
        
        assertEquals(mockRoom, viewModel.createdRoom.value)
        assertNull(viewModel.createdRoom.value?.description)
    }

    @Test
    fun `createRoom should handle null maxParticipants`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomType = "public"
        
        val mockRoom = Room(
            id = "room1",
            name = roomName,
            description = null,
            roomType = roomType,
            isActive = true,
            maxParticipants = null,
            currentParticipants = null,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        
        val capturedRequest = slot<CreateRoomRequest>()
        val successResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(capture(capturedRequest)) } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns mockRoom
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, null, roomType, null)
        advanceUntilIdle()
        
        assertNull(capturedRequest.captured.maxParticipants)
    }

    @Test
    fun `createRoom should set error on failed response`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomType = "public"
        
        val errorResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(any()) } returns errorResponse
        every { errorResponse.isSuccessful } returns false
        every { errorResponse.code() } returns 400
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, null, roomType, null)
        advanceUntilIdle()
        
        assertEquals("Failed to create room", viewModel.error.value)
        assertNull(viewModel.createdRoom.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `createRoom should set error on exception`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomType = "public"
        val exceptionMessage = "Network error"
        
        coEvery { apiService.createRoom(any()) } throws Exception(exceptionMessage)
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, null, roomType, null)
        advanceUntilIdle()
        
        assertEquals(exceptionMessage, viewModel.error.value)
        assertNull(viewModel.createdRoom.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `isLoading should be true during API call`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomType = "public"
        
        var isLoadingDuringCall = false
        val successResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(any()) } coAnswers {
            isLoadingDuringCall = viewModel.isLoading.value
            successResponse
        }
        every { successResponse.isSuccessful } returns true
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, null, roomType, null)
        // Advance just enough to start the coroutine and set loading to true
        testDispatcher.scheduler.advanceTimeBy(1)
        advanceUntilIdle()
        
        assertTrue("isLoading should be true during API call", isLoadingDuringCall)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `clearError should clear error state`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomType = "public"
        
        val errorResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(any()) } returns errorResponse
        every { errorResponse.isSuccessful } returns false
        every { errorResponse.code() } returns 400
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, null, roomType, null)
        advanceUntilIdle()
        
        assertEquals("Failed to create room", viewModel.error.value)
        
        viewModel.clearError()
        advanceUntilIdle()
        
        assertNull(viewModel.error.value)
    }

    @Test
    fun `clearCreatedRoom should clear created room state`() = runTest(testDispatcher) {
        val roomName = "Test Room"
        val roomType = "public"
        
        val mockRoom = Room(
            id = "room1",
            name = roomName,
            description = null,
            roomType = roomType,
            isActive = true,
            maxParticipants = null,
            currentParticipants = null,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        
        val successResponse = mockk<retrofit2.Response<Room>>(relaxed = true)
        coEvery { apiService.createRoom(any()) } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns mockRoom
        
        viewModel = CreateRoomViewModel()
        viewModel.createRoom(roomName, null, roomType, null)
        advanceUntilIdle()
        
        assertEquals(mockRoom, viewModel.createdRoom.value)
        
        viewModel.clearCreatedRoom()
        advanceUntilIdle()
        
        assertNull(viewModel.createdRoom.value)
    }
}

