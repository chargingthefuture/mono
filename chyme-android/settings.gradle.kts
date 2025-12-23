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
        // Primary: Official WebRTC Maven repository (if available)
        maven {
            url = uri("https://maven.webrtc.org")
        }
        // Alternative: Community-maintained GitHub repository
        // Note: raw.githubusercontent.com may not have proper Maven layout
        maven {
            url = uri("https://raw.githubusercontent.com/ALEXGREENCH/google-webrtc/master")
        }
        // Alternative: Try lowercase username variant
        maven {
            url = uri("https://raw.githubusercontent.com/alexgreench/google-webrtc/master")
        }
        // Alternative: JitPack (may have WebRTC artifacts)
        maven {
            url = uri("https://jitpack.io")
        }
        // Alternative: Sonatype snapshots
        maven {
            url = uri("https://oss.sonatype.org/content/repositories/snapshots/")
        }
        // JCenter is deprecated but still needed as fallback for some WebRTC artifacts
        // Only include WebRTC module from JCenter to minimize deprecated repository usage
        jcenter() {
            content {
                includeModule("org.webrtc", "google-webrtc")
            }
        }
    }
}

rootProject.name = "Chyme"
include(":app")
