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
        // WebRTC is now available via com.infobip:google-webrtc on Maven Central
        // (drop-in replacement for org.webrtc:google-webrtc from deprecated JCenter)
    }
}

rootProject.name = "Chyme"
include(":app")
