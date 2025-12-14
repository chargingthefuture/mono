package com.chyme.android.auth

import android.content.Context
import android.content.SharedPreferences
import com.chyme.android.data.model.User
import io.mockk.capture
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import kotlinx.coroutines.flow.first
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

class OTPAuthManagerTest {
    private lateinit var context: Context
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var editor: SharedPreferences.Editor
    private lateinit var authManager: OTPAuthManager
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        context = mockk(relaxed = true)
        sharedPreferences = mockk(relaxed = true)
        editor = mockk(relaxed = true)
        
        every { context.getSharedPreferences("chyme_auth", Context.MODE_PRIVATE) } returns sharedPreferences
        every { sharedPreferences.edit() } returns editor
        every { editor.putString(any(), any()) } returns editor
        every { editor.remove(any()) } returns editor
        every { editor.apply() } returns Unit
    }

    @After
    fun tearDown() {
        // Clean up if needed
    }

    @Test
    fun `getAuthToken should return null when no token is stored`() {
        every { sharedPreferences.getString("auth_token", null) } returns null
        
        authManager = OTPAuthManager(context)
        
        assertNull(authManager.getAuthToken())
    }

    @Test
    fun `getAuthToken should return stored token`() {
        val token = "test-token-123"
        every { sharedPreferences.getString("auth_token", null) } returns token
        
        authManager = OTPAuthManager(context)
        
        assertEquals(token, authManager.getAuthToken())
    }

    @Test
    fun `saveAuthToken should store token and user ID`() {
        val token = "test-token-123"
        val userId = "user-123"
        
        every { sharedPreferences.getString("auth_token", null) } returns null
        
        authManager = OTPAuthManager(context)
        authManager.saveAuthToken(token, userId)
        
        verify { editor.putString("auth_token", token) }
        verify { editor.putString("user_id", userId) }
        verify { editor.apply() }
    }

    @Test
    fun `checkAuthState should set isSignedIn to true when token exists`() = runTest(testDispatcher) {
        val token = "test-token-123"
        every { sharedPreferences.getString("auth_token", null) } returns token
        
        authManager = OTPAuthManager(context)
        advanceUntilIdle()
        
        val isSignedIn = authManager.isSignedIn.first()
        assertTrue(isSignedIn == true)
    }

    @Test
    fun `checkAuthState should set isSignedIn to false when no token`() = runTest(testDispatcher) {
        every { sharedPreferences.getString("auth_token", null) } returns null
        
        authManager = OTPAuthManager(context)
        advanceUntilIdle()
        
        val isSignedIn = authManager.isSignedIn.first()
        assertTrue(isSignedIn == false)
    }

    @Test
    fun `signOut should clear token and user ID`() {
        val token = "test-token-123"
        every { sharedPreferences.getString("auth_token", null) } returns token
        
        authManager = OTPAuthManager(context)
        authManager.signOut()
        
        verify { editor.remove("auth_token") }
        verify { editor.remove("user_id") }
        verify { editor.apply() }
    }

    @Test
    fun `signOut should set isSignedIn to false`() = runTest(testDispatcher) {
        val token = "test-token-123"
        every { sharedPreferences.getString("auth_token", null) } returnsMany listOf(token, null)
        
        authManager = OTPAuthManager(context)
        advanceUntilIdle()
        
        authManager.signOut()
        advanceUntilIdle()
        
        val isSignedIn = authManager.isSignedIn.first()
        assertTrue(isSignedIn == false)
    }

    @Test
    fun `signOut should clear user`() = runTest(testDispatcher) {
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
        
        every { sharedPreferences.getString("auth_token", null) } returnsMany listOf("token", null)
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(mockUser)
        advanceUntilIdle()
        
        assertEquals(mockUser, authManager.user.first())
        
        authManager.signOut()
        advanceUntilIdle()
        
        assertNull(authManager.user.first())
    }

    @Test
    fun `getUserId should return stored user ID`() {
        val userId = "user-123"
        every { sharedPreferences.getString("user_id", null) } returns userId
        
        authManager = OTPAuthManager(context)
        
        assertEquals(userId, authManager.getUserId())
    }

    @Test
    fun `getUserId should return null when no user ID is stored`() {
        every { sharedPreferences.getString("user_id", null) } returns null
        
        authManager = OTPAuthManager(context)
        
        assertNull(authManager.getUserId())
    }

    @Test
    fun `needsApproval should return false when user is null`() {
        every { sharedPreferences.getString("auth_token", null) } returns null
        
        authManager = OTPAuthManager(context)
        
        assertFalse(authManager.needsApproval())
    }

    @Test
    fun `needsApproval should return false when user is approved`() {
        val approvedUser = User(
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
        
        every { sharedPreferences.getString("auth_token", null) } returns "token"
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(approvedUser)
        
        assertFalse(authManager.needsApproval())
    }

    @Test
    fun `needsApproval should return false when user is admin`() {
        val adminUser = User(
            id = "user1",
            email = "test@example.com",
            firstName = "Test",
            lastName = "User",
            profileImageUrl = null,
            quoraProfileUrl = null,
            isAdmin = true,
            isVerified = true,
            isApproved = false
        )
        
        every { sharedPreferences.getString("auth_token", null) } returns "token"
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(adminUser)
        
        assertFalse(authManager.needsApproval())
    }

    @Test
    fun `needsApproval should return true when user is not approved and not admin`() {
        val unapprovedUser = User(
            id = "user1",
            email = "test@example.com",
            firstName = "Test",
            lastName = "User",
            profileImageUrl = null,
            quoraProfileUrl = null,
            isAdmin = false,
            isVerified = true,
            isApproved = false
        )
        
        every { sharedPreferences.getString("auth_token", null) } returns "token"
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(unapprovedUser)
        
        assertTrue(authManager.needsApproval())
    }

    @Test
    fun `isAdmin should return false when user is null`() {
        every { sharedPreferences.getString("auth_token", null) } returns null
        
        authManager = OTPAuthManager(context)
        
        assertFalse(authManager.isAdmin())
    }

    @Test
    fun `isAdmin should return true when user is admin`() {
        val adminUser = User(
            id = "user1",
            email = "test@example.com",
            firstName = "Test",
            lastName = "User",
            profileImageUrl = null,
            quoraProfileUrl = null,
            isAdmin = true,
            isVerified = true,
            isApproved = true
        )
        
        every { sharedPreferences.getString("auth_token", null) } returns "token"
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(adminUser)
        
        assertTrue(authManager.isAdmin())
    }

    @Test
    fun `isAdmin should return false when user is not admin`() {
        val regularUser = User(
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
        
        every { sharedPreferences.getString("auth_token", null) } returns "token"
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(regularUser)
        
        assertFalse(authManager.isAdmin())
    }

    @Test
    fun `updateUser should update user state`() = runTest(testDispatcher) {
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
        
        every { sharedPreferences.getString("auth_token", null) } returns "token"
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(mockUser)
        advanceUntilIdle()
        
        assertEquals(mockUser, authManager.user.first())
    }

    @Test
    fun `updateUser with null should clear user`() = runTest(testDispatcher) {
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
        
        every { sharedPreferences.getString("auth_token", null) } returns "token"
        
        authManager = OTPAuthManager(context)
        authManager.updateUser(mockUser)
        advanceUntilIdle()
        
        assertEquals(mockUser, authManager.user.first())
        
        authManager.updateUser(null)
        advanceUntilIdle()
        
        assertNull(authManager.user.first())
    }
}

