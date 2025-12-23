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
        // JCenter is deprecated but still needed as primary source for WebRTC artifacts
        // Only include WebRTC module from JCenter to minimize deprecated repository usage
        jcenter() {
            content {
                includeModule("org.webrtc", "google-webrtc")
            }
        }
        // Alternative: JitPack (may have WebRTC artifacts)
        maven {
            url = uri("https://jitpack.io")
        }
        // Alternative: Sonatype snapshots
        maven {
            url = uri("https://oss.sonatype.org/content/repositories/snapshots/")
        }
    }
}

rootProject.name = "Chyme"
include(":app")
