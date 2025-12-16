package com.roshadgu.treehouse.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorPalette = darkColors(
  primary = Purple200,
  primaryVariant = Purple700,
  secondary = Teal200
)

private val LightColorPalette = lightColors(
  primary = Purple500,
  primaryVariant = Purple700,
  secondary = Teal200

  /* Other default colors to override
background = Color.White,
surface = Color.White,
onPrimary = Color.White,
onSecondary = Color.Black,
onBackground = Color.Black,
onSurface = Color.Black,
*/
)

@Composable
fun TreehouseTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable() () -> Unit) {
  MaterialTheme( colors = if (darkTheme) DarkThemeColors else LightThemeColors) {
    content()
  }
}

private val LightThemeColors = lightColors(
  primary = primary,
  onPrimary = gray900,
  secondary = Color.White,
  background = purple,
  onBackground = Color.White,
  surface = background,
  onSurface = gray900
)

private val DarkThemeColors = darkColors(
  primary = yellow,
  onPrimary = gray900,
  secondary = Color.White,
  background = gray900,
  onBackground = Color.White,
  surface = gray700,
  onSurface = Color.White,
)