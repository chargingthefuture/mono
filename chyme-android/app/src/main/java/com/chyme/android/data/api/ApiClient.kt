package com.chyme.android.data.api

import android.util.Log
import com.chyme.android.BuildConfig
import com.chyme.android.auth.OTPAuthManager
import io.sentry.okhttp.SentryOkHttpInterceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Base URL from BuildConfig (set in local.properties or CI env)
    private val BASE_URL = BuildConfig.PLATFORM_API_BASE_URL

    // OTPAuthManager instance - must be set before making API calls
    private var authManager: OTPAuthManager? = null

    /**
     * Initialize ApiClient with OTPAuthManager
     * Call this in your Application class or MainActivity
     */
    fun initialize(authManager: OTPAuthManager) {
        Log.i("ApiClient", "Initializing ApiClient with provided OTPAuthManager")
        ApiClient.authManager = authManager
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        // Very verbose HTTP logging to help debug issues when running on device only
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        // Capture network errors and breadcrumbs to Sentry (if configured)
        .addInterceptor(SentryOkHttpInterceptor())
        .addInterceptor { chain ->
            val originalRequest = chain.request()
            val requestBuilder = originalRequest.newBuilder()

            // Add OTP auth token if available
            val token = authManager?.getAuthToken()
            if (token != null) {
                requestBuilder.addHeader("Authorization", "Bearer $token")
            } else {
                Log.w("ApiClient", "Auth token is null - requests will be unauthenticated")
            }

            val request = requestBuilder.build()
            Log.d(
                "ApiClient",
                "Sending request ${request.method} ${request.url} " +
                    "headers=${request.headers}"
            )

            val response = chain.proceed(request)
            Log.d(
                "ApiClient",
                "Received response code=${response.code} for ${request.method} ${request.url}"
            )
            response
        }
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

