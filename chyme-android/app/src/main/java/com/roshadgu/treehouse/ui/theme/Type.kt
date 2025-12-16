package com.roshadgu.treehouse.ui.theme

import androidx.compose.material.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.roshadgu.treehouse.R

// Set of Material typography styles to start with
val Typography = Typography(
  body1 = TextStyle(
    fontFamily = FontFamily.Default,
    fontWeight = FontWeight.Normal,
    fontSize = 16.sp
  )
)
val nunito_fonts = FontFamily(
  Font(R.font.nunito_light, FontWeight.Light),
  Font(R.font.nunito_black, FontWeight.Normal),
  Font(R.font.nunito_bold, FontWeight.Bold)
)