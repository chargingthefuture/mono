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
        // WebRTC libraries are available on Maven Central
        // org.webrtc:google-webrtc or com.infobip:google-webrtc can be used
    }
}

rootProject.name = "Chyme"
include(":app")
