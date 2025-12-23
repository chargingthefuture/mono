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
        // WebRTC libraries - multiple sources for org.webrtc:google-webrtc
        // Primary: Community-maintained GitHub repository
        maven {
            url = uri("https://raw.githubusercontent.com/ALEXGREENCH/google-webrtc/master")
        }
        // Alternative: webrtc-sdk repository (if primary fails)
        maven {
            url = uri("https://jitpack.io")
        }
        // JCenter is deprecated but still needed as fallback for some WebRTC artifacts
        jcenter() {
            content {
                includeModule("org.webrtc", "google-webrtc")
            }
        }
    }
}

rootProject.name = "Chyme"
include(":app")
