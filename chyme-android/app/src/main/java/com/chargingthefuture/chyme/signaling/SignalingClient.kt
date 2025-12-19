package com.chargingthefuture.chyme.signaling

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.launch
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener

/**
 * Very small WebSocket signaling client for Chyme WebRTC.
 *
 * This class is room-scoped: create one per room and connect it to the
 * signaling endpoint. It emits raw JSON strings; higher layers are
 * responsible for parsing and driving WebRTC.
 */
class SignalingClient(
    private val roomId: String,
    private val authToken: String,
    private val endpointUrl: String,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.IO)
) {
    private val client = OkHttpClient()
    private var webSocket: WebSocket? = null

    private val _events = MutableSharedFlow<String>(
        replay = 0,
        extraBufferCapacity = 64,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<String> = _events

    fun connect() {
        if (webSocket != null) return

        val baseUrl = HttpUrl.parse(endpointUrl) ?: return
        val url = baseUrl.newBuilder()
            .addQueryParameter("roomId", roomId)
            .build()

        val request = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $authToken")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(ws: WebSocket, text: String) {
                scope.launch { _events.emit(text) }
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                // TODO: surface signaling failures to ViewModel / Sentry
                webSocket = null
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                webSocket = null
            }
        })
    }

    fun send(messageJson: String) {
        webSocket?.send(messageJson)
    }

    fun close() {
        webSocket?.close(1000, "Client closing")
        webSocket = null
    }
}


