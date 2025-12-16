package com.chyme.android.ui.viewmodel

import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.api.ApiService
import com.chyme.android.data.model.Room
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
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
import okhttp3.ResponseBody
import retrofit2.Response

class RoomListViewModelTest {
    private lateinit var apiService: ApiService
    private lateinit var viewModel: RoomListViewModel
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
        
        val successResponse = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms(null) } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns mockRooms
        
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
        
        val successResponse = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms("public") } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns publicRooms
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms("public")
        advanceUntilIdle()
        
        coVerify { apiService.getRooms("public") }
        assertEquals(1, viewModel.rooms.value.size)
        assertEquals("public", viewModel.rooms.value.first().roomType)
    }

    @Test
    fun `loadRooms should set error on failed response`() = runTest(testDispatcher) {
        val errorBody = mockk<ResponseBody>(relaxed = true)
        every { errorBody.string() } returns ""
        val errorResponse = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms(null) } returns errorResponse
        every { errorResponse.isSuccessful } returns false
        every { errorResponse.code() } returns 500
        every { errorResponse.errorBody() } returns errorBody
        
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
        
        val successResponse = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms("private") } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns privateRooms
        
        viewModel = RoomListViewModel()
        viewModel.setFilter("private")
        advanceUntilIdle()
        
        assertEquals("private", viewModel.filterType.value)
        coVerify { apiService.getRooms("private") }
        assertEquals(1, viewModel.rooms.value.size)
    }

    @Test
    fun `setFilter with null should clear filter`() = runTest(testDispatcher) {
        val allRooms = listOf<Room>()
        val successResponse1 = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        val successResponse2 = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms("public") } returns successResponse1
        coEvery { apiService.getRooms(null) } returns successResponse2
        every { successResponse1.isSuccessful } returns true
        every { successResponse1.body() } returns allRooms
        every { successResponse2.isSuccessful } returns true
        every { successResponse2.body() } returns allRooms
        
        viewModel = RoomListViewModel()
        viewModel.setFilter("public")
        advanceUntilIdle()
        
        viewModel.setFilter(null)
        advanceUntilIdle()
        
        assertNull(viewModel.filterType.value)
        coVerify { apiService.getRooms(null) }
    }

    @Test
    fun `refresh should reload rooms with current filter`() = runTest(testDispatcher) {
        val mockRooms = listOf<Room>()
        val successResponse1 = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        val successResponse2 = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms("public") } returnsMany listOf(successResponse1, successResponse2)
        every { successResponse1.isSuccessful } returns true
        every { successResponse1.body() } returns mockRooms
        every { successResponse2.isSuccessful } returns true
        every { successResponse2.body() } returns mockRooms
        
        viewModel = RoomListViewModel()
        viewModel.setFilter("public")
        advanceUntilIdle()
        
        viewModel.refresh()
        advanceUntilIdle()
        
        coVerify(exactly = 2) { apiService.getRooms("public") }
    }

    @Test
    fun `isLoading should be true during API call`() = runTest(testDispatcher) {
        var isLoadingDuringCall = false
        val successResponse = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms(null) } coAnswers {
            // At this point, the coroutine should have set isLoading = true
            isLoadingDuringCall = viewModel.isLoading.value
            successResponse
        }
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns emptyList()
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms()
        // Advance the dispatcher to start the coroutine and execute until the API call
        testDispatcher.scheduler.advanceUntilIdle()
        
        assertTrue("isLoading should be true during API call", isLoadingDuringCall)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `loadRooms should handle empty response`() = runTest(testDispatcher) {
        val successResponse = mockk<retrofit2.Response<List<Room>>>(relaxed = true)
        coEvery { apiService.getRooms(null) } returns successResponse
        every { successResponse.isSuccessful } returns true
        every { successResponse.body() } returns null
        
        viewModel = RoomListViewModel()
        viewModel.loadRooms()
        advanceUntilIdle()
        
        assertTrue(viewModel.rooms.value.isEmpty())
        assertFalse(viewModel.isLoading.value)
    }
}

