package com.chyme.android.data.api

import com.chyme.android.BuildConfig
import com.chyme.android.auth.ClerkAuthManager
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Base URL from BuildConfig (set in local.properties)
    private val BASE_URL = BuildConfig.PLATFORM_API_BASE_URL
    
    // ClerkAuthManager instance - must be set before making API calls
    private var clerkAuthManager: ClerkAuthManager? = null
    
    /**
     * Initialize ApiClient with ClerkAuthManager
     * Call this in your Application class or MainActivity
     */
    fun initialize(authManager: ClerkAuthManager) {
        clerkAuthManager = authManager
    }
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val requestBuilder = chain.request().newBuilder()
            
            // Add Clerk session token if available
            // Note: Using runBlocking here because OkHttp interceptors are synchronous
            // In production, consider caching the token to avoid blocking
            val token = runBlocking {
                getClerkToken()
            }
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
    
    /**
     * Get Clerk session token for API authentication
     * This is called from OkHttp interceptor, so we use runBlocking
     */
    private suspend fun getClerkToken(): String? {
        return try {
            clerkAuthManager?.getSessionToken()
        } catch (e: Exception) {
            android.util.Log.e("ApiClient", "Error getting Clerk token", e)
            null
        }
    }
}

