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
        // WebRTC repository - hosts org.webrtc:google-webrtc:1.0.32006
        // Estigia repository mirrors the WebRTC library from JCenter
        maven {
            url = uri("http://estigia.lsi.us.es:1681/artifactory/libs-release")
            isAllowInsecureProtocol = true
        }
    }
}

rootProject.name = "Chyme"
include(":app")
