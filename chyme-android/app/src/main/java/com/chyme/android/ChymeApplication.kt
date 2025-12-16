package com.chyme.android

import android.app.Application
import android.util.Log
import com.chyme.android.BuildConfig
import io.sentry.android.core.SentryAndroid

class ChymeApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Sentry for client-side error tracking (only if DSN is configured)
        if (BuildConfig.SENTRY_DSN.isNotBlank()) {
            SentryAndroid.init(this) { options ->
                options.dsn = BuildConfig.SENTRY_DSN
                // Capture all performance traces; adjust if this is too noisy later
                options.tracesSampleRate = 1.0
                // Enable useful logs in debug builds
                options.isDebug = BuildConfig.DEBUG
            }
            Log.i("ChymeApp", "Sentry initialized for Android")
        } else {
            Log.w("ChymeApp", "Sentry DSN is blank - client-side error tracking is disabled")
        }
    }
}

