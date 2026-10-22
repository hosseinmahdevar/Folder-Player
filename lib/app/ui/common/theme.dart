/// FolderPlay Flutter Theme System
/// Multi-theme engine: Nocturne (OLED), Leatherbound (Amber/Warm), Nordic (Cyan/Slate), Solar (High Contrast)

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

enum AppThemeMode {
  nocturne,    // OLED Dark
  leatherbound, // Warm sepia / leather
  nordic,      // Deep ocean slate / cyan
  solar,       // High contrast golden amber
}

class FolderPlayTheme {
  // Nocturne (Default OLED)
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

  static ThemeData getTheme(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.leatherbound:
        return _buildTheme(
          scaffoldBg: const Color(0xFF140D0A),
          cardBg: const Color(0xFF241812),
          surfaceBg: const Color(0xFF30211A),
          primary: const Color(0xFFE6B865),
          secondary: const Color(0xFF34D399),
          tertiary: const Color(0xFFFB923C),
          border: const Color(0xFF4A362B),
          textHigh: const Color(0xFFFEF7EA),
          textMuted: const Color(0xFFA69285),
        );
      case AppThemeMode.nordic:
        return _buildTheme(
          scaffoldBg: const Color(0xFF0B1118),
          cardBg: const Color(0xFF15202E),
          surfaceBg: const Color(0xFF1D2C3E),
          primary: const Color(0xFF38BDF8),
          secondary: const Color(0xFF2DD4BF),
          tertiary: const Color(0xFFA78BFA),
          border: const Color(0xFF2B3E55),
          textHigh: const Color(0xFFFFFFFF),
          textMuted: const Color(0xFF94A3B8),
        );
      case AppThemeMode.solar:
        return _buildTheme(
          scaffoldBg: const Color(0xFF050505),
          cardBg: const Color(0xFF161616),
          surfaceBg: const Color(0xFF222222),
          primary: const Color(0xFFF59E0B),
          secondary: const Color(0xFF10B981),
          tertiary: const Color(0xFF38BDF8),
          border: const Color(0xFF3A3A3A),
          textHigh: const Color(0xFFFFFFFF),
          textMuted: const Color(0xFF9CA3AF),
        );
      case AppThemeMode.nocturne:
      default:
        return darkTheme;
    }
  }

  static ThemeData _buildTheme({
    required Color scaffoldBg,
    required Color cardBg,
    required Color surfaceBg,
    required Color primary,
    required Color secondary,
    required Color tertiary,
    required Color border,
    required Color textHigh,
    required Color textMuted,
  }) {
    final textTheme = TextTheme(
      displayLarge: GoogleFonts.literata(
        fontSize: 36,
        fontWeight: FontWeight.w600,
        color: textHigh,
        letterSpacing: -0.02,
      ),
      headlineMedium: GoogleFonts.literata(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: textHigh,
        letterSpacing: -0.01,
      ),
      titleMedium: GoogleFonts.manrope(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textHigh,
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
        color: primary,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: scaffoldBg,
      colorScheme: ColorScheme.dark(
        surface: surfaceBg,
        primary: primary,
        secondary: secondary,
        tertiary: tertiary,
        onSurface: textHigh,
        outline: border,
      ),
      textTheme: textTheme,
      cardTheme: CardThemeData(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: border),
        ),
      ),
    );
  }

  static ThemeData get darkTheme => _buildTheme(
    scaffoldBg: oledBase,
    cardBg: surfaceLow,
    surfaceBg: surface,
    primary: amberGold,
    secondary: studioEmerald,
    tertiary: calibrationCyan,
    border: borderSubtle,
    textHigh: textParchment,
    textMuted: textMuted,
  );
}
