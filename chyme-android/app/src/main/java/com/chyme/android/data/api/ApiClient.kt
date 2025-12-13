package com.chyme.android.data.api

import com.chyme.android.BuildConfig
import com.chyme.android.auth.OTPAuthManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Base URL from BuildConfig (set in local.properties)
    private val BASE_URL = BuildConfig.PLATFORM_API_BASE_URL
    
    // OTPAuthManager instance - must be set before making API calls
    private var authManager: OTPAuthManager? = null
    
    /**
     * Initialize ApiClient with OTPAuthManager
     * Call this in your Application class or MainActivity
     */
    fun initialize(authManager: OTPAuthManager) {
        ApiClient.authManager = authManager
    }
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val requestBuilder = chain.request().newBuilder()
            
            // Add OTP auth token if available
            val token = authManager?.getAuthToken()
            if (token != null) {
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }
            
            chain.proceed(requestBuilder.build())
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

