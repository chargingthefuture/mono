package com.chargingthefuture.chyme.di

import android.content.Context
import com.chargingthefuture.chyme.auth.MobileAuthManager
import com.chargingthefuture.chyme.data.repository.RoomRepository
import com.chargingthefuture.chyme.data.repository.UserRepository
import com.chargingthefuture.chyme.data.repository.WebRTCRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideRoomRepository(): RoomRepository {
        return RoomRepository()
    }
    
    @Provides
    @Singleton
    fun provideUserRepository(): UserRepository {
        return UserRepository()
    }
    
    @Provides
    @Singleton
    fun provideWebRTCRepository(
        @ApplicationContext context: Context
    ): WebRTCRepository {
        return WebRTCRepository(context)
    }
    
    @Provides
    @Singleton
    fun provideMobileAuthManager(
        @ApplicationContext context: Context
    ): MobileAuthManager {
        return MobileAuthManager(context)
    }
}

