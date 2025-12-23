pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // WebRTC libraries - using com.dafruits:webrtc from Maven Central
        // No additional repositories needed as it's available on Maven Central
        // Alternative: JitPack (may have WebRTC artifacts)
        maven {
            url = uri("https://jitpack.io")
        }
    }
}

rootProject.name = "Chyme"
include(":app")
