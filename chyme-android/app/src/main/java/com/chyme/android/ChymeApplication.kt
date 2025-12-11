package com.chyme.android

import android.app.Application
import com.clerk.android.core.Clerk
import com.chyme.android.BuildConfig

class ChymeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Clerk SDK
        val clerkPublishableKey = BuildConfig.CLERK_PUBLISHABLE_KEY
        if (clerkPublishableKey.isNotEmpty() && clerkPublishableKey.startsWith("pk_")) {
            Clerk.initialize(
                context = this,
                publishableKey = clerkPublishableKey
            )
        } else {
            // Log error if key is missing or invalid
            android.util.Log.e("ChymeApplication", "Clerk publishable key is missing or invalid. Please set CLERK_PUBLISHABLE_KEY in local.properties")
        }
    }
}

