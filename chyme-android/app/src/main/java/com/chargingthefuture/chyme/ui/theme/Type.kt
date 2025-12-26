package com.chargingthefuture.chyme.ui.theme

import androidx.compose.material.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.chargingthefuture.chyme.R

// Comic book style typography - Bold headings, increased letter spacing for accessibility
// Note: All letterSpacing values use Sp units (not Em) to prevent lerp errors when Compose
// interpolates between text styles during animations or state transitions
val Typography = Typography(
  h1 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Bold,
    fontSize = 32.sp,
    letterSpacing = 1.6.sp // 0.05 * 32 = 1.6sp (converted from Em for consistency)
  ),
  h2 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Bold,
    fontSize = 28.sp,
    letterSpacing = 1.4.sp // 0.05 * 28 = 1.4sp
  ),
  h3 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Bold,
    fontSize = 24.sp,
    letterSpacing = 1.2.sp // 0.05 * 24 = 1.2sp
  ),
  h4 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Bold,
    fontSize = 20.sp,
    letterSpacing = 1.0.sp // 0.05 * 20 = 1.0sp
  ),
  h5 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Bold,
    fontSize = 18.sp,
    letterSpacing = 0.9.sp // 0.05 * 18 = 0.9sp
  ),
  h6 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Bold,
    fontSize = 16.sp,
    letterSpacing = 0.8.sp // 0.05 * 16 = 0.8sp
  ),
  body1 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Normal,
    fontSize = 16.sp,
    letterSpacing = 0.32.sp // 0.02 * 16 = 0.32sp (increased letter spacing for better readability)
  ),
  body2 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Normal,
    fontSize = 14.sp,
    letterSpacing = 0.28.sp // 0.02 * 14 = 0.28sp
  ),
  button = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Bold,
    fontSize = 16.sp,
    letterSpacing = 0.8.sp // 0.05 * 16 = 0.8sp
  ),
  caption = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Normal,
    fontSize = 12.sp,
    letterSpacing = 0.24.sp // 0.02 * 12 = 0.24sp
  )
)

// Legacy font family (kept for compatibility)
val nunito_fonts = FontFamily(
  Font(R.font.nunito_light, FontWeight.Light),
  Font(R.font.nunito_black, FontWeight.Normal),
  Font(R.font.nunito_bold, FontWeight.Bold)
)