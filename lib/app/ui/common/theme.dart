/// FolderPlay Flutter Theme System
/// Reconstructed from Stitch folderplay_design_system/DESIGN.md

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class FolderPlayTheme {
  // Palette Tokens
  static const Color oledBase = Color(0xFF070A0E);
  static const Color surfaceLowest = Color(0xFF090F16);
  static const Color surfaceLow = Color(0xFF121820);
  static const Color surface = Color(0xFF1A2028);
  static const Color surfaceHigh = Color(0xFF242A33);
  static const Color surfaceHighest = Color(0xFF2F353E);

  static const Color amberGold = Color(0xFFFCD34D);
  static const Color studioEmerald = Color(0xFF10B981);
  static const Color calibrationCyan = Color(0xFF06B6D4);
  static const Color borderSubtle = Color(0xFF283342);
  static const Color textParchment = Color(0xFFF3F4F6);
  static const Color textMuted = Color(0xFF8F9CAE);

  static ThemeData get darkTheme {
    final textTheme = TextTheme(
      displayLarge: GoogleFonts.literata(
        fontSize: 36,
        fontWeight: FontWeight.w600,
        color: textParchment,
        letterSpacing: -0.02,
      ),
      headlineMedium: GoogleFonts.literata(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: textParchment,
        letterSpacing: -0.01,
      ),
      titleMedium: GoogleFonts.manrope(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textParchment,
      ),
      bodyMedium: GoogleFonts.manrope(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: textMuted,
        height: 1.5,
      ),
      labelSmall: GoogleFonts.manrope(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.05,
        color: amberGold,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: oledBase,
      colorScheme: const ColorScheme.dark(
        surface: surface,
        primary: amberGold,
        secondary: studioEmerald,
        tertiary: calibrationCyan,
        onSurface: textParchment,
        outline: borderSubtle,
      ),
      textTheme: textTheme,
      cardTheme: CardTheme(
        color: surfaceLow,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: borderSubtle),
        ),
      ),
    );
  }
}
