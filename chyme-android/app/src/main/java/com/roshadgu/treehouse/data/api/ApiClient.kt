package com.roshadgu.treehouse.data.api

import android.util.Log
import com.roshadgu.treehouse.utils.SentryHelper
import io.sentry.SentryLevel
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Base URL for the Chyme API - matches the webapp at https://app.chargingthefuture.com/apps/chyme
    private const val BASE_URL = "https://app.chargingthefuture.com"
    
    private var authToken: String? = null
    
    fun setAuthToken(token: String?) {
        val hadToken = authToken != null
        authToken = token
        
        SentryHelper.addBreadcrumb(
            message = "Auth token updated in ApiClient",
            category = "api",
            level = SentryLevel.DEBUG,
            data = mapOf(
                "had_token" to hadToken.toString(),
                "has_token" to (token != null).toString(),
                "token_length" to (token?.length?.toString() ?: "0")
            )
        )
        
        Log.d("ApiClient", "Auth token ${if (token != null) "set" else "cleared"}")
    }
    
    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val newRequest = if (authToken != null) {
            SentryHelper.addBreadcrumb(
                message = "Adding auth token to request",
                category = "api",
                level = SentryLevel.DEBUG,
                data = mapOf(
                    "url" to originalRequest.url.toString(),
                    "method" to originalRequest.method
                )
            )
            
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $authToken")
                .build()
        } else {
            originalRequest
        }
        
        try {
            val response = chain.proceed(newRequest)
            
            // Log response for debugging
            if (!response.isSuccessful) {
                SentryHelper.addBreadcrumb(
                    message = "API request failed",
                    category = "api",
                    level = SentryLevel.WARNING,
                    data = mapOf(
                        "url" to newRequest.url.toString(),
                        "method" to newRequest.method,
                        "status_code" to response.code.toString(),
                        "message" to (response.message ?: "null")
                    )
                )
            }
            
            response
        } catch (e: Exception) {
            SentryHelper.captureException(
                throwable = e,
                level = SentryLevel.ERROR,
                tags = mapOf("api" to "request_error"),
                extra = mapOf(
                    "url" to newRequest.url.toString(),
                    "method" to newRequest.method,
                    "error_type" to e.javaClass.simpleName
                ),
                message = "Network request failed in auth interceptor"
            )
            throw e
        }
    }
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ChymeApiService = retrofit.create(ChymeApiService::class.java)
}

