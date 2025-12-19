package com.chargingthefuture.chyme.signaling

import android.util.Log
import com.chargingthefuture.chyme.utils.SentryHelper
import io.sentry.SentryLevel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener

enum class SignalingConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    RECONNECTING,
    FAILED
}

data class SignalingError(
    val message: String,
    val throwable: Throwable? = null,
    val responseCode: Int? = null
)

/**
 * WebSocket signaling client for Chyme WebRTC with connection state tracking,
 * automatic reconnection, and error reporting.
 *
 * This class is room-scoped: create one per room and connect it to the
 * signaling endpoint. It emits raw JSON strings; higher layers are
 * responsible for parsing and driving WebRTC.
 */
class SignalingClient(
    private val roomId: String,
    private val authToken: String,
    private val userId: String? = null,
    private val endpointUrl: String,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.IO + Job())
) {
    private val client = OkHttpClient()
    private var webSocket: WebSocket? = null
    private var reconnectJob: Job? = null
    private var isManuallyClosed = false
    private var reconnectAttempt = 0
    
    // Reconnection backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    private val maxReconnectAttempts = 10
    private val maxBackoffMs = 30_000L
    private val initialBackoffMs = 1_000L

    private val _events = MutableSharedFlow<String>(
        replay = 0,
        extraBufferCapacity = 64,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<String> = _events.asSharedFlow()

    private val _connectionState = MutableStateFlow<SignalingConnectionState>(SignalingConnectionState.DISCONNECTED)
    val connectionState: StateFlow<SignalingConnectionState> = _connectionState.asStateFlow()

    private val _errors = MutableSharedFlow<SignalingError>(
        replay = 0,
        extraBufferCapacity = 16,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val errors: SharedFlow<SignalingError> = _errors.asSharedFlow()

    fun connect() {
        if (webSocket != null && _connectionState.value == SignalingConnectionState.CONNECTED) {
            Log.d("SignalingClient", "Already connected, skipping")
            return
        }

        isManuallyClosed = false
        reconnectAttempt = 0
        performConnect()
    }

    private fun performConnect() {
        if (isManuallyClosed) {
            Log.d("SignalingClient", "Manually closed, not reconnecting")
            return
        }

        val state = _connectionState.value
        if (state == SignalingConnectionState.CONNECTING || state == SignalingConnectionState.RECONNECTING) {
            Log.d("SignalingClient", "Already connecting, skipping")
            return
        }

        _connectionState.value = if (state == SignalingConnectionState.DISCONNECTED) {
            SignalingConnectionState.CONNECTING
        } else {
            SignalingConnectionState.RECONNECTING
        }

        val baseUrl = endpointUrl.toHttpUrlOrNull() ?: run {
            val error = SignalingError("Invalid endpoint URL: $endpointUrl")
            handleConnectionFailure(error, null)
            return
        }

        val urlBuilder = baseUrl.newBuilder()
            .addQueryParameter("roomId", roomId)
        
        // Include userId in query for debugging (server derives from auth token)
        userId?.let {
            urlBuilder.addQueryParameter("userId", it)
        }

        val request = Request.Builder()
            .url(urlBuilder.build())
            .addHeader("Authorization", "Bearer $authToken")
            .build()

        try {
            webSocket = client.newWebSocket(request, object : WebSocketListener() {
                override fun onOpen(ws: WebSocket, response: Response) {
                    Log.d("SignalingClient", "WebSocket connected roomId=$roomId")
                    _connectionState.value = SignalingConnectionState.CONNECTED
                    reconnectAttempt = 0
                    
                    SentryHelper.addBreadcrumb(
                        message = "Signaling WebSocket connected",
                        category = "signaling",
                        level = SentryLevel.INFO,
                        data = mapOf(
                            "roomId" to roomId,
                            "userId" to (userId ?: "unknown")
                        )
                    )
                }

                override fun onMessage(ws: WebSocket, text: String) {
                    scope.launch { _events.emit(text) }
                }

                override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                    val responseCode = response?.code
                    val errorMessage = when {
                        responseCode != null -> "WebSocket connection failed: HTTP $responseCode"
                        t.message != null -> "WebSocket connection failed: ${t.message}"
                        else -> "WebSocket connection failed: Unknown error"
                    }
                    
                    val error = SignalingError(errorMessage, t, responseCode)
                    handleConnectionFailure(error, response)
                }

                override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                    Log.d("SignalingClient", "WebSocket closed code=$code reason=$reason")
                    webSocket = null
                    
                    if (!isManuallyClosed) {
                        // Unexpected close - attempt reconnection
                        _connectionState.value = SignalingConnectionState.DISCONNECTED
                        scheduleReconnect()
                    } else {
                        _connectionState.value = SignalingConnectionState.DISCONNECTED
                    }
                }
            })
        } catch (e: Exception) {
            val error = SignalingError("Failed to create WebSocket connection: ${e.message}", e)
            handleConnectionFailure(error, null)
        }
    }

    private fun handleConnectionFailure(error: SignalingError, response: Response?) {
        webSocket = null
        _connectionState.value = SignalingConnectionState.FAILED
        
        // Emit error to observers
        scope.launch {
            _errors.emit(error)
        }

        // Report to Sentry
        SentryHelper.captureException(
            throwable = error.throwable ?: Exception(error.message),
            level = SentryLevel.ERROR,
            tags = mapOf(
                "signaling" to "websocket_failure",
                "roomId" to roomId,
                "userId" to (userId ?: "unknown")
            ),
            extra = mapOf(
                "error_message" to error.message,
                "response_code" to (error.responseCode?.toString() ?: "null"),
                "reconnect_attempt" to reconnectAttempt.toString()
            ),
            message = "Signaling WebSocket connection failure"
        )

        Log.e("SignalingClient", error.message, error.throwable)

        // Schedule reconnection if not manually closed
        if (!isManuallyClosed) {
            scheduleReconnect()
        }
    }

    private fun scheduleReconnect() {
        reconnectJob?.cancel()
        reconnectJob = scope.launch {
            if (reconnectAttempt >= maxReconnectAttempts) {
                val error = SignalingError(
                    "Max reconnection attempts ($maxReconnectAttempts) reached. Connection failed."
                )
                _connectionState.value = SignalingConnectionState.FAILED
                _errors.emit(error)
                
                SentryHelper.captureMessage(
                    message = "Signaling WebSocket max reconnection attempts reached",
                    level = SentryLevel.ERROR,
                    tags = mapOf(
                        "signaling" to "max_reconnect_attempts",
                        "roomId" to roomId
                    ),
                    extra = mapOf(
                        "max_attempts" to maxReconnectAttempts.toString(),
                        "userId" to (userId ?: "unknown")
                    )
                )
                return@launch
            }

            reconnectAttempt++
            val backoffMs = minOf(
                initialBackoffMs * (1 shl (reconnectAttempt - 1)),
                maxBackoffMs
            )

            Log.d("SignalingClient", "Scheduling reconnect attempt $reconnectAttempt in ${backoffMs}ms")
            delay(backoffMs)

            if (!isManuallyClosed) {
                performConnect()
            }
        }
    }

    fun send(messageJson: String) {
        val state = _connectionState.value
        if (state != SignalingConnectionState.CONNECTED) {
            Log.w("SignalingClient", "Cannot send message: not connected (state=$state)")
            scope.launch {
                _errors.emit(SignalingError("Cannot send message: not connected"))
            }
            return
        }

        val sent = webSocket?.send(messageJson) ?: false
        if (!sent) {
            Log.w("SignalingClient", "Failed to send message: WebSocket is null or closed")
            scope.launch {
                _errors.emit(SignalingError("Failed to send message: WebSocket unavailable"))
            }
        }
    }

    fun close() {
        isManuallyClosed = true
        reconnectJob?.cancel()
        reconnectJob = null
        webSocket?.close(1000, "Client closing")
        webSocket = null
        _connectionState.value = SignalingConnectionState.DISCONNECTED
        
        Log.d("SignalingClient", "Signaling client closed roomId=$roomId")
    }

    fun dispose() {
        close()
        scope.cancel()
    }
}


