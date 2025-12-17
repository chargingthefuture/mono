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

            // Use breadcrumb instead of captureMessage during app startup - safer and won't block
            // captureMessage can fail if Sentry isn't fully ready yet
            SentryHelper.addBreadcrumb(
                message = "TreehouseApp.onCreate() - Application started",
                category = "app_lifecycle",
                level = SentryLevel.INFO,
                data = mapOf(
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


