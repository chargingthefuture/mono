package com.chargingthefuture.chyme.utils

import android.content.Context
import android.util.Log
import com.chargingthefuture.chyme.BuildConfig
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
            // Use provided DSN, or BuildConfig (from CI/local.properties)
            val sentryDsn = dsn 
                ?: BuildConfig.SENTRY_DSN.takeIf { it.isNotEmpty() }
            
            // If no DSN is provided, skip initialization
            if (sentryDsn.isNullOrEmpty()) {
                Log.w(TAG, "Sentry DSN not configured - Sentry error tracking is disabled. Set SENTRY_DSN_ANDROID in environment or local.properties")
                return
            }
            
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
                options.beforeSend = SentryOptions.BeforeSendCallback { event, _ ->
                    addVerboseContext(event)
                    event
                }
            }
            
            // Mark as initialized but don't call captureMessage yet - Sentry needs a moment to fully initialize
            isInitialized = true
            Log.d(TAG, "Sentry initialized successfully")
            
            // Use addBreadcrumb instead of captureMessage during init - it's safer
            // Don't call captureMessage here as Sentry might not be fully ready yet
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
        if (!isInitialized) {
            Log.w(TAG, "Sentry not initialized, skipping exception capture: ${throwable.message}")
            return
        }
        
        try {
            Log.e(TAG, "Capturing exception: ${throwable.message}", throwable)
            
            Sentry.captureException(throwable) { scope ->
                try {
                    scope.level = level
                    
                    // Add tags safely
                    tags.forEach { (key, value) ->
                        try {
                            scope.setTag(key, value)
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to set tag $key", e)
                        }
                    }
                    
                    // Add extra context safely
                    extra.forEach { (key, value) ->
                        try {
                            scope.setExtra(key, value.toString())
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to set extra $key", e)
                        }
                    }
                    
                    // Add message if provided
                    message?.let {
                        try {
                            scope.setExtra("error_message", it)
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to set error_message", e)
                        }
                    }
                    
                    // Add breadcrumb safely
                    try {
                        scope.addBreadcrumb(
                            Breadcrumb().apply {
                                this.message = message ?: throwable.message ?: "Exception occurred"
                                this.level = level
                                this.category = "exception"
                                this.type = "error"
                            }
                        )
                    } catch (e: Exception) {
                        Log.w(TAG, "Failed to add breadcrumb", e)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error in Sentry scope callback", e)
                }
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
        if (!isInitialized) {
            Log.w(TAG, "Sentry not initialized, skipping message capture: $message")
            return
        }
        
        try {
            Log.d(TAG, "Capturing message [$level]: $message")
            
            Sentry.captureMessage(message, level) { scope ->
                try {
                    // Add tags safely
                    tags.forEach { (key, value) ->
                        try {
                            scope.setTag(key, value)
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to set tag $key", e)
                        }
                    }
                    
                    // Add extra context safely
                    extra.forEach { (key, value) ->
                        try {
                            scope.setExtra(key, value.toString())
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to set extra $key", e)
                        }
                    }
                    
                    // Add breadcrumb safely
                    try {
                        scope.addBreadcrumb(
                            Breadcrumb().apply {
                                this.message = message
                                this.level = level
                                this.category = "log"
                                this.type = "message"
                            }
                        )
                    } catch (e: Exception) {
                        Log.w(TAG, "Failed to add breadcrumb", e)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error in Sentry scope callback", e)
                }
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
        if (!isInitialized) {
            Log.d(TAG, "Sentry not initialized, skipping breadcrumb: [$category] $message")
            return
        }
        
        try {
            Log.d(TAG, "Breadcrumb [$category]: $message")
            
            Sentry.addBreadcrumb(
                Breadcrumb().apply {
                    this.message = message
                    this.category = category
                    this.level = level
                    this.type = "default"
                    data.forEach { (key, value) ->
                        try {
                            this.setData(key, value)
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to set breadcrumb data $key", e)
                        }
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
        if (!isInitialized) {
            Log.w(TAG, "Sentry not initialized, skipping setUser")
            return
        }
        
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
        if (!isInitialized) {
            return
        }
        
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
        if (!isInitialized) {
            return
        }
        
        try {
            Sentry.setTag(key, value)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set tag", e)
        }
    }
}

