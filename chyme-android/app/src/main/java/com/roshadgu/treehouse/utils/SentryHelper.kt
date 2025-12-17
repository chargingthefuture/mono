package com.roshadgu.treehouse.utils

import android.content.Context
import android.util.Log
import io.sentry.Breadcrumb
import io.sentry.Sentry
import io.sentry.SentryEvent
import io.sentry.SentryLevel
import io.sentry.SentryOptions
import io.sentry.android.core.SentryAndroid

object SentryHelper {
    private const val TAG = "SentryHelper"
    private var isInitialized = false
    
    /**
     * Initialize Sentry with verbose error tracking
     * Call this in Application.onCreate() or MainActivity.onCreate()
     */
    fun init(context: Context, dsn: String? = null) {
        if (isInitialized) {
            Log.w(TAG, "Sentry already initialized")
            return
        }
        
        try {
            val sentryDsn = dsn ?: "https://c4cabee62513c0173e0b2f0bf250e47c@o4510455625482240.ingest.us.sentry.io/4510548956151808"
            
            SentryAndroid.init(context) { options ->
                options.dsn = sentryDsn
                options.environment = "android"
                options.tracesSampleRate = 1.0 // 100% of transactions for verbose logging
                options.profilesSampleRate = 1.0 // 100% profiling
                
                // Enable all integrations for verbose logging
                options.isEnableUserInteractionTracing = true
                options.isEnableAutoActivityLifecycleTracing = true
                options.isAttachScreenshot = false // Disable for privacy
                options.isAttachViewHierarchy = true
                
                // Set beforeSend to add extra context
                options.beforeSend = SentryOptions.BeforeSendCallback { event, hint ->
                    addVerboseContext(event)
                    event
                }
            }
            
            isInitialized = true
            Log.d(TAG, "Sentry initialized successfully with DSN: $sentryDsn")
            captureMessage("Sentry initialized", SentryLevel.INFO)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize Sentry", e)
        }
    }
    
    /**
     * Add verbose context to Sentry events
     */
    private fun addVerboseContext(event: SentryEvent) {
        event.setTag("platform", "android")
        event.setTag("verbose_logging", "enabled")
    }
    
    /**
     * Capture an exception with verbose context
     */
    fun captureException(
        throwable: Throwable,
        level: SentryLevel = SentryLevel.ERROR,
        tags: Map<String, String> = emptyMap(),
        extra: Map<String, Any> = emptyMap(),
        message: String? = null
    ) {
        try {
            Log.e(TAG, "Capturing exception: ${throwable.message}", throwable)
            
            Sentry.captureException(throwable) { scope ->
                scope.level = level
                
                // Add tags
                tags.forEach { (key, value) ->
                    scope.setTag(key, value)
                }
                
                // Add extra context
                extra.forEach { (key, value) ->
                    scope.setExtra(key, value.toString())
                }
                
                // Add message if provided
                message?.let {
                    scope.setExtra("error_message", it)
                }
                
                // Add breadcrumb
                scope.addBreadcrumb(
                    Breadcrumb().apply {
                        this.message = message ?: throwable.message ?: "Exception occurred"
                        this.level = level
                        this.category = "exception"
                        this.type = "error"
                    }
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to capture exception in Sentry", e)
        }
    }
    
    /**
     * Capture a message with verbose context
     */
    fun captureMessage(
        message: String,
        level: SentryLevel = SentryLevel.INFO,
        tags: Map<String, String> = emptyMap(),
        extra: Map<String, Any> = emptyMap()
    ) {
        try {
            Log.d(TAG, "Capturing message [$level]: $message")
            
            Sentry.captureMessage(message, level) { scope ->
                // Add tags
                tags.forEach { (key, value) ->
                    scope.setTag(key, value)
                }
                
                // Add extra context
                extra.forEach { (key, value) ->
                    scope.setExtra(key, value.toString())
                }
                
                // Add breadcrumb
                scope.addBreadcrumb(
                    Breadcrumb().apply {
                        this.message = message
                        this.level = level
                        this.category = "log"
                        this.type = "message"
                    }
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to capture message in Sentry", e)
        }
    }
    
    /**
     * Add breadcrumb for debugging
     */
    fun addBreadcrumb(
        message: String,
        category: String = "debug",
        level: SentryLevel = SentryLevel.DEBUG,
        data: Map<String, String> = emptyMap()
    ) {
        try {
            Log.d(TAG, "Breadcrumb [$category]: $message")
            
            Sentry.addBreadcrumb(
                Breadcrumb().apply {
                    this.message = message
                    this.category = category
                    this.level = level
                    this.type = "default"
                    data.forEach { (key, value) ->
                        this.setData(key, value)
                    }
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to add breadcrumb", e)
        }
    }
    
    /**
     * Set user context
     */
    fun setUser(userId: String?, email: String? = null, username: String? = null) {
        try {
            if (userId != null) {
                Sentry.setUser(
                    io.sentry.protocol.User().apply {
                        id = userId
                        email?.let { this.email = it }
                        username?.let { this.username = it }
                    }
                )
                Log.d(TAG, "Set Sentry user: $userId")
            } else {
                Sentry.setUser(null)
                Log.d(TAG, "Cleared Sentry user")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set Sentry user", e)
        }
    }
    
    /**
     * Set extra context
     */
    fun setExtra(key: String, value: Any) {
        try {
            Sentry.setExtra(key, value.toString())
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set extra context", e)
        }
    }
    
    /**
     * Set tag
     */
    fun setTag(key: String, value: String) {
        try {
            Sentry.setTag(key, value)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set tag", e)
        }
    }
}

