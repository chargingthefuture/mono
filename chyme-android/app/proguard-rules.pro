# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# WebRTC - Keep all classes to prevent ClassNotFoundException
# The org.webrtc.Environment class and other WebRTC classes are required at runtime
-keep class org.webrtc.** { *; }
-keep interface org.webrtc.** { *; }
-keep enum org.webrtc.** { *; }
-keepclassmembers class org.webrtc.** { *; }
-dontwarn org.webrtc.**
# Specifically keep Environment class which is required by PeerConnectionFactory.builder()
-keep class org.webrtc.Environment { *; }
-keep class org.webrtc.Environment$* { *; }