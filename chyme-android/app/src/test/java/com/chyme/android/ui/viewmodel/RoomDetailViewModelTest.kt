package com.chyme.android.ui.viewmodel

import com.chyme.android.data.api.ApiClient
import com.chyme.android.data.api.ApiService
import com.chyme.android.data.model.Message
import com.chyme.android.data.model.Room
import com.chyme.android.data.model.RoomParticipant
import com.chyme.android.data.model.SendMessageRequest
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
import retrofit2.Response

class RoomDetailViewModelTest {
    private lateinit var apiService: ApiService
    private lateinit var viewModel: RoomDetailViewModel
    private val testDispatcher = StandardTestDispatcher()
    private val roomId = "test-room-id"

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
    fun `initial state should have null room and empty messages`() = runTest(testDispatcher) {
        val mockRoom = Room(
            id = roomId,
            name = "Test Room",
            description = "Test Description",
            roomType = "public",
            isActive = true,
            maxParticipants = 10,
            currentParticipants = 5,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        val mockMessages = emptyList<Message>()
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockRoom)
        coEvery { apiService.getMessages(roomId) } returns Response.success(mockMessages)
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        assertEquals(mockRoom, viewModel.room.value)
        assertTrue(viewModel.messages.value.isEmpty())
        assertFalse(viewModel.isJoined.value)
        assertFalse(viewModel.isSpeaking.value)
    }

    @Test
    fun `loadRoom should update room on successful response`() = runTest(testDispatcher) {
        val mockRoom = Room(
            id = roomId,
            name = "Test Room",
            description = "Test Description",
            roomType = "public",
            isActive = true,
            maxParticipants = null,
            currentParticipants = null,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockRoom)
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        assertEquals(mockRoom, viewModel.room.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
    }

    @Test
    fun `loadRoom should set error on failed response`() = runTest(testDispatcher) {
        coEvery { apiService.getRoom(roomId) } returns Response.error(404, mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        assertEquals("Failed to load room", viewModel.error.value)
        assertNull(viewModel.room.value)
    }

    @Test
    fun `loadMessages should update messages on successful response`() = runTest(testDispatcher) {
        val mockMessages = listOf(
            Message(
                id = "msg1",
                roomId = roomId,
                userId = "user1",
                content = "Hello",
                isAnonymous = false,
                createdAt = "2024-01-01T00:00:00Z"
            ),
            Message(
                id = "msg2",
                roomId = roomId,
                userId = "user2",
                content = "World",
                isAnonymous = true,
                createdAt = "2024-01-01T00:01:00Z"
            )
        )
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(mockMessages)
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        assertEquals(2, viewModel.messages.value.size)
        assertEquals(mockMessages, viewModel.messages.value)
    }

    @Test
    fun `sendMessage should refresh messages on success`() = runTest(testDispatcher) {
        val messageContent = "Test message"
        val mockMessage = Message(
            id = "msg1",
            roomId = roomId,
            userId = "user1",
            content = messageContent,
            isAnonymous = true,
            createdAt = "2024-01-01T00:00:00Z"
        )
        val updatedMessages = listOf(mockMessage)
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returnsMany listOf(
            Response.success(emptyList()),
            Response.success(updatedMessages)
        )
        coEvery { apiService.sendMessage(roomId, any()) } returns Response.success(mockMessage)
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.sendMessage(messageContent)
        advanceUntilIdle()
        
        coVerify { apiService.sendMessage(roomId, SendMessageRequest(messageContent)) }
        coVerify(exactly = 2) { apiService.getMessages(roomId) }
        assertNull(viewModel.error.value)
    }

    @Test
    fun `sendMessage should set error on failure`() = runTest(testDispatcher) {
        val messageContent = "Test message"
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        coEvery { apiService.sendMessage(roomId, any()) } returns Response.error(400, mockk())
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.sendMessage(messageContent)
        advanceUntilIdle()
        
        assertEquals("Failed to send message", viewModel.error.value)
    }

    @Test
    fun `joinRoom should update isJoined and load participants on success`() = runTest(testDispatcher) {
        val mockParticipants = listOf(
            RoomParticipant(
                id = "part1",
                roomId = roomId,
                userId = "user1",
                isMuted = false,
                isSpeaking = false,
                joinedAt = "2024-01-01T00:00:00Z",
                leftAt = null
            )
        )
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        coEvery { apiService.joinRoom(roomId) } returns Response.success(mapOf("status" to "joined"))
        coEvery { apiService.getParticipants(roomId) } returns Response.success(mockParticipants)
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.joinRoom()
        advanceUntilIdle()
        
        assertTrue(viewModel.isJoined.value)
        coVerify { apiService.joinRoom(roomId) }
        coVerify { apiService.getParticipants(roomId) }
        assertEquals(1, viewModel.participants.value.size)
    }

    @Test
    fun `joinRoom should set error on failure`() = runTest(testDispatcher) {
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        coEvery { apiService.joinRoom(roomId) } returns Response.error(403, mockk())
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.joinRoom()
        advanceUntilIdle()
        
        assertEquals("Failed to join room", viewModel.error.value)
        assertFalse(viewModel.isJoined.value)
    }

    @Test
    fun `leaveRoom should update isJoined and isSpeaking on success`() = runTest(testDispatcher) {
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        coEvery { apiService.leaveRoom(roomId) } returns Response.success(mapOf("status" to "left"))
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        // Set joined and speaking to true first
        viewModel.joinRoom()
        advanceUntilIdle()
        viewModel.toggleSpeaking()
        advanceUntilIdle()
        
        viewModel.leaveRoom()
        advanceUntilIdle()
        
        assertFalse(viewModel.isJoined.value)
        assertFalse(viewModel.isSpeaking.value)
        coVerify { apiService.leaveRoom(roomId) }
    }

    @Test
    fun `leaveRoom should set error on failure`() = runTest(testDispatcher) {
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        coEvery { apiService.leaveRoom(roomId) } returns Response.error(500, mockk())
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.leaveRoom()
        advanceUntilIdle()
        
        assertEquals("Failed to leave room", viewModel.error.value)
    }

    @Test
    fun `loadParticipants should update participants on success`() = runTest(testDispatcher) {
        val mockParticipants = listOf(
            RoomParticipant(
                id = "part1",
                roomId = roomId,
                userId = "user1",
                isMuted = false,
                isSpeaking = true,
                joinedAt = "2024-01-01T00:00:00Z",
                leftAt = null
            ),
            RoomParticipant(
                id = "part2",
                roomId = roomId,
                userId = "user2",
                isMuted = true,
                isSpeaking = false,
                joinedAt = "2024-01-01T00:00:00Z",
                leftAt = null
            )
        )
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        coEvery { apiService.getParticipants(roomId) } returns Response.success(mockParticipants)
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.loadParticipants()
        advanceUntilIdle()
        
        assertEquals(2, viewModel.participants.value.size)
        assertEquals(mockParticipants, viewModel.participants.value)
    }

    @Test
    fun `loadParticipants should handle exception silently`() = runTest(testDispatcher) {
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        coEvery { apiService.getParticipants(roomId) } throws Exception("Network error")
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.loadParticipants()
        advanceUntilIdle()
        
        // Should not crash and participants should remain empty
        assertTrue(viewModel.participants.value.isEmpty())
    }

    @Test
    fun `toggleSpeaking should toggle isSpeaking state`() = runTest(testDispatcher) {
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockk())
        coEvery { apiService.getMessages(roomId) } returns Response.success(emptyList())
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        assertFalse(viewModel.isSpeaking.value)
        
        viewModel.toggleSpeaking()
        advanceUntilIdle()
        assertTrue(viewModel.isSpeaking.value)
        
        viewModel.toggleSpeaking()
        advanceUntilIdle()
        assertFalse(viewModel.isSpeaking.value)
    }

    @Test
    fun `refresh should reload room and messages`() = runTest(testDispatcher) {
        val mockRoom = Room(
            id = roomId,
            name = "Test Room",
            description = null,
            roomType = "public",
            isActive = true,
            maxParticipants = null,
            currentParticipants = null,
            createdBy = "user1",
            createdAt = "2024-01-01T00:00:00Z",
            updatedAt = "2024-01-01T00:00:00Z"
        )
        val mockMessages = emptyList<Message>()
        
        coEvery { apiService.getRoom(roomId) } returns Response.success(mockRoom)
        coEvery { apiService.getMessages(roomId) } returns Response.success(mockMessages)
        
        viewModel = RoomDetailViewModel(roomId)
        advanceUntilIdle()
        
        viewModel.refresh()
        advanceUntilIdle()
        
        coVerify(exactly = 2) { apiService.getRoom(roomId) }
        coVerify(exactly = 2) { apiService.getMessages(roomId) }
    }
}

