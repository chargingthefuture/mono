package com.chargingthefuture.chyme.ui.theme

import androidx.compose.ui.graphics.Color

// Comic book theme - High contrast black/white with dramatic green accent
// Based on landing-page comic book style: dark background, light foreground, green accent

// Light theme - Comic book style (dark theme with high contrast)
// Primary is green for buttons and brand elements (Material Design convention)
val LightPrimary = Color(0xFF4ADE80) // Primary green brand color - dramatic accent
val LightOnPrimary = Color(0xFF141414) // Very dark (oklch 0.08 0 0) - black text on green for high contrast
val LightSecondary = Color(0xFF2E2E2E) // Dark gray (oklch 0.18 0 0) - secondary surface
val LightOnSecondary = Color(0xFFFAFAFA) // Almost white text on dark gray
val LightBackground = Color(0xFF141414) // Very dark background (oklch 0.08 0 0) - comic book dark
val LightOnBackground = Color(0xFFFAFAFA) // Almost white text (oklch 0.98 0 0) - comic book light
val LightSurface = Color(0xFF1F1F1F) // Slightly lighter than background (oklch 0.12 0 0) - card surface
val LightOnSurface = Color(0xFFFAFAFA) // Almost white text on surface
val LightError = Color(0xFFEF4444) // High contrast red for errors (WCAG AAA compliant)
val LightOnError = Color(0xFFFAFAFA) // White text on red error

// Dark theme - Same comic book style (consistent across themes)
// Primary is green for buttons and brand elements (Material Design convention)
val DarkPrimary = Color(0xFF4ADE80) // Primary green brand color - dramatic accent
val DarkOnPrimary = Color(0xFF141414) // Very dark - black text on green for high contrast
val DarkSecondary = Color(0xFF2E2E2E) // Dark gray (oklch 0.18 0 0) - secondary surface
val DarkOnSecondary = Color(0xFFFAFAFA) // Almost white text on dark gray
val DarkBackground = Color(0xFF141414) // Very dark background (oklch 0.08 0 0) - comic book dark
val DarkOnBackground = Color(0xFFFAFAFA) // Almost white text (oklch 0.98 0 0) - comic book light
val DarkSurface = Color(0xFF1F1F1F) // Slightly lighter than background (oklch 0.12 0 0) - card surface
val DarkOnSurface = Color(0xFFFAFAFA) // Almost white text on surface
val DarkError = Color(0xFFEF4444) // High contrast red for errors (WCAG AAA compliant)
val DarkOnError = Color(0xFFFAFAFA) // White text on red error

// Comic book accent colors - Distinct colors for accessibility
val AccentGreen = Color(0xFF4ADE80) // Primary green brand color - dramatic accent (success/primary)
val AccentRed = Color(0xFFEF4444) // High contrast red for errors/destructive actions (WCAG AAA)
val AccentYellow = Color(0xFFF59E0B) // High contrast amber for warnings (WCAG AAA)

// Comic book grays - High contrast variants
val Gray900 = Color(0xFF141414) // Very dark (background)
val Gray800 = Color(0xFF1F1F1F) // Dark (card/surface)
val Gray700 = Color(0xFF2E2E2E) // Medium dark (secondary)
val Gray600 = Color(0xFF404040) // Medium (borders - oklch 0.25 0 0)
val Gray500 = Color(0xFFA6A6A6) // Medium gray (muted foreground - oklch 0.65 0 0)
val Gray400 = Color(0xFFD1D5DB) // Light gray
val Gray300 = Color(0xFFE5E5E5) // Very light gray
val Gray100 = Color(0xFFFAFAFA) // Almost white (foreground)

