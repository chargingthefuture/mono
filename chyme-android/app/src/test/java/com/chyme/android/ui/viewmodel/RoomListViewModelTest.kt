package com.chyme.android.ui.viewmodel

import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.api.ApiService
import com.chyme.android.data.model.Room
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.verify
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import retrofit2.Response

class RoomListViewModelTest {
    private lateinit var apiService: ApiService
    private lateinit var viewModel: RoomListViewModel
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        apiService = mockk(relaxed = true)
        
        // Mock ApiClient
        mockkObject(ApiClient)
        every { ApiClient.apiService } returns apiService
    }

    @After
    fun tearDown() {
        // Clean up if needed
    }

    @Test
    fun `initial state should have empty rooms and not loading`() = runTest(testDispatcher) {
        viewModel = RoomListViewModel()
        advanceUntilIdle()
        
        assertTrue(viewModel.rooms.value.isEmpty())
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
        assertNull(viewModel.filterType.value)
    }

    @Test
    fun `loadRooms should update rooms on successful response`() = runTest(testDispatcher) {
        val mockRooms = listOf(
            Room(
                id = "room1",
                name = "Test Room 1",
                description = "Description 1",
                roomType = "public",
                isActive = true,
                maxParticipants = 10,
                currentParticipants = 5,
                createdBy = "user1",
                createdAt = "2024-01-01T00:00:00Z",
                updatedAt = "2024-01-01T00:00:00Z"
            ),
            Room(
                id = "room2",
                name = "Test Room 2",
                description = "Description 2",
                roomType = "private",
                isActive = true,
                maxParticipants = 5,
                currentParticipants = 2,
                createdBy = "user2",
                createdAt = "2024-01-02T00:00:00Z",
                updatedAt = "2024-01-02T00:00:00Z"
            )
        )
        
        coEvery { apiService.getRooms(null) } returns Response.success(mockRooms)
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms()
        advanceUntilIdle()
        
        assertEquals(2, viewModel.rooms.value.size)
        assertEquals(mockRooms, viewModel.rooms.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `loadRooms should filter by room type`() = runTest(testDispatcher) {
        val publicRooms = listOf(
            Room(
                id = "room1",
                name = "Public Room",
                description = null,
                roomType = "public",
                isActive = true,
                maxParticipants = null,
                currentParticipants = null,
                createdBy = "user1",
                createdAt = "2024-01-01T00:00:00Z",
                updatedAt = "2024-01-01T00:00:00Z"
            )
        )
        
        coEvery { apiService.getRooms("public") } returns Response.success(publicRooms)
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms("public")
        advanceUntilIdle()
        
        verify { apiService.getRooms("public") }
        assertEquals(1, viewModel.rooms.value.size)
        assertEquals("public", viewModel.rooms.value.first().roomType)
    }

    @Test
    fun `loadRooms should set error on failed response`() = runTest(testDispatcher) {
        coEvery { apiService.getRooms(null) } returns Response.error(500, mockk())
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms()
        advanceUntilIdle()
        
        assertEquals("Failed to load rooms", viewModel.error.value)
        assertTrue(viewModel.rooms.value.isEmpty())
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `loadRooms should set error on exception`() = runTest(testDispatcher) {
        val exceptionMessage = "Network error"
        coEvery { apiService.getRooms(null) } throws Exception(exceptionMessage)
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms()
        advanceUntilIdle()
        
        assertEquals(exceptionMessage, viewModel.error.value)
        assertTrue(viewModel.rooms.value.isEmpty())
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `setFilter should update filter type and load rooms`() = runTest(testDispatcher) {
        val privateRooms = listOf(
            Room(
                id = "room1",
                name = "Private Room",
                description = null,
                roomType = "private",
                isActive = true,
                maxParticipants = null,
                currentParticipants = null,
                createdBy = "user1",
                createdAt = "2024-01-01T00:00:00Z",
                updatedAt = "2024-01-01T00:00:00Z"
            )
        )
        
        coEvery { apiService.getRooms("private") } returns Response.success(privateRooms)
        
        viewModel = RoomListViewModel()
        viewModel.setFilter("private")
        advanceUntilIdle()
        
        assertEquals("private", viewModel.filterType.value)
        verify { apiService.getRooms("private") }
        assertEquals(1, viewModel.rooms.value.size)
    }

    @Test
    fun `setFilter with null should clear filter`() = runTest(testDispatcher) {
        val allRooms = listOf<Room>()
        coEvery { apiService.getRooms(null) } returns Response.success(allRooms)
        
        viewModel = RoomListViewModel()
        viewModel.setFilter("public")
        advanceUntilIdle()
        
        viewModel.setFilter(null)
        advanceUntilIdle()
        
        assertNull(viewModel.filterType.value)
        verify { apiService.getRooms(null) }
    }

    @Test
    fun `refresh should reload rooms with current filter`() = runTest(testDispatcher) {
        val mockRooms = listOf<Room>()
        coEvery { apiService.getRooms(null) } returns Response.success(mockRooms)
        coEvery { apiService.getRooms("public") } returns Response.success(mockRooms)
        
        viewModel = RoomListViewModel()
        viewModel.setFilter("public")
        advanceUntilIdle()
        
        viewModel.refresh()
        advanceUntilIdle()
        
        verify(exactly = 2) { apiService.getRooms("public") }
    }

    @Test
    fun `isLoading should be true during API call`() = runTest(testDispatcher) {
        coEvery { apiService.getRooms(null) } coAnswers {
            assertTrue(viewModel.isLoading.value)
            Response.success(emptyList())
        }
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms()
        advanceUntilIdle()
        
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `loadRooms should handle empty response`() = runTest(testDispatcher) {
        coEvery { apiService.getRooms(null) } returns Response.success(null)
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms()
        advanceUntilIdle()
        
        assertTrue(viewModel.rooms.value.isEmpty())
        assertFalse(viewModel.isLoading.value)
    }
}

