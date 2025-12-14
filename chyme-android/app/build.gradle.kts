import java.util.Properties
import java.io.FileInputStream
import org.gradle.api.GradleException

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.chyme.android"
    compileSdk = 35

    // Load local.properties (for local development)
    val localProperties = Properties()
    val localPropertiesFile = rootProject.file("local.properties")
    if (localPropertiesFile.exists()) {
        localProperties.load(FileInputStream(localPropertiesFile))
    }

    defaultConfig {
        applicationId = "com.chyme.android"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
        
        // BuildConfig fields from local.properties or environment variables (for CI)
        // Priority: Environment variable > local.properties > default
        val platformApiUrl = System.getenv("PLATFORM_API_BASE_URL")
            ?: localProperties.getProperty("PLATFORM_API_BASE_URL")
            ?: "https://your-platform-domain.com"
        
        buildConfigField("String", "PLATFORM_API_BASE_URL", "\"$platformApiUrl\"")
    }

    signingConfigs {
        create("release") {
            // Try to load from environment variables (for CI) or local.properties (for local dev)
            // Path is relative to the root project directory (chyme-android/)
            val keystorePathEnv = System.getenv("KEYSTORE_PATH")
            val keystorePath = if (keystorePathEnv.isNullOrBlank()) {
                localProperties.getProperty("KEYSTORE_PATH")?.takeIf { it.isNotBlank() }
                    ?: "chyme-release-key.jks"
            } else {
                keystorePathEnv
            }
            
            val keystorePasswordEnv = System.getenv("KEYSTORE_PASSWORD")
            val keystorePassword = if (keystorePasswordEnv.isNullOrBlank()) {
                localProperties.getProperty("KEYSTORE_PASSWORD")?.takeIf { it.isNotBlank() }
            } else {
                keystorePasswordEnv
            }
            
            val keyAliasEnv = System.getenv("KEY_ALIAS")
            val keyAlias = if (keyAliasEnv.isNullOrBlank()) {
                localProperties.getProperty("KEY_ALIAS")?.takeIf { it.isNotBlank() }
                    ?: "chyme-release"
            } else {
                keyAliasEnv
            }
            
            val keyPasswordEnv = System.getenv("KEY_PASSWORD")
            val keyPassword = if (keyPasswordEnv.isNullOrBlank()) {
                localProperties.getProperty("KEY_PASSWORD")?.takeIf { it.isNotBlank() }
                    ?: keystorePassword
            } else {
                keyPasswordEnv
            }
            
            // Only configure signing if we have the required credentials
            if (keystorePassword != null && keystorePath.isNotBlank()) {
                val keystoreFile = rootProject.file(keystorePath)
                if (keystoreFile.exists()) {
                    storeFile = keystoreFile
                    storePassword = keystorePassword
                    this.keyAlias = keyAlias
                    this.keyPassword = keyPassword
                } else {
                    throw GradleException(
                        "Keystore file not found at: ${keystoreFile.absolutePath}\n" +
                        "Please ensure KEYSTORE_PATH in local.properties or KEYSTORE_PATH environment variable points to a valid keystore file."
                    )
                }
            } else {
                throw GradleException(
                    "Missing keystore password for release signing!\n" +
                    "Please set KEYSTORE_PASSWORD in local.properties or as KEYSTORE_PASSWORD environment variable.\n" +
                    "You may also need KEY_PASSWORD and KEY_ALIAS (defaults to 'chyme-release')."
                )
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Always use the release signing config (it will fail during config if credentials are missing)
            signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.activity:activity-compose:1.8.1")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // Lifecycle
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.6.2")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Gson for JSON parsing
    implementation("com.google.code.gson:gson:2.10.1")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    
    // DataStore for local storage
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Coil for image loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("androidx.arch.core:core-testing:2.2.0")
    testImplementation("app.cash.turbine:turbine:1.0.0")
    
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("io.mockk:mockk-android:1.13.8")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

