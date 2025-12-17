package com.roshadgu.treehouse

import android.app.Application
import android.os.Build
import android.util.Log
import com.roshadgu.treehouse.utils.SentryHelper
import io.sentry.SentryLevel

/**
 * Application class used to initialize Sentry as early as possible.
 * This should give us visibility even if MainActivity never finishes onCreate.
 */
class TreehouseApp : Application() {

    override fun onCreate() {
        super.onCreate()

        try {
            // Initialize Sentry very early
            SentryHelper.init(this)

            // Basic device/app context for debugging cold-start crashes
            SentryHelper.captureMessage(
                message = "TreehouseApp.onCreate()",
                level = SentryLevel.INFO,
                tags = mapOf(
                    "stage" to "app_start",
                    "device" to Build.DEVICE,
                    "model" to Build.MODEL,
                    "brand" to Build.BRAND
                )
            )

            Log.d("TreehouseApp", "Sentry initialized in Application.onCreate")
        } catch (e: Exception) {
            // If Sentry init itself fails, at least log to Logcat
            Log.e("TreehouseApp", "Failed to initialize Sentry in Application", e)
        }
    }
}


