import 'package:flutter/material.dart';

class AppTheme {
  // Primary Colors
  static const Color bg = Color(0xFF0A0E1A);
  static const Color surface = Color(0xFF131929);
  static const Color card = Color(0xFF1C2438);
  static const Color gold = Color(0xFFC9A84C);
  static const Color goldLt = Color(0xFFE8C97A);
  static const Color cream = Color(0xFFF5F0E8);
  static const Color muted = Color(0xFF8B92A5);
  static const Color border = Color(0xFF252E44);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Add to AppTheme constants
  static const Color cardDark = Color(0xFF0F1420);


  // Text Styles
  static const TextStyle headline1 = TextStyle(
    color: cream,
    fontSize: 30,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
    height: 1.1,
  );

  static const TextStyle headline2 = TextStyle(
    color: cream,
    fontSize: 24,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
  );

  static const TextStyle headline3 = TextStyle(
    color: cream,
    fontSize: 20,
    fontWeight: FontWeight.w700,
  );

  static const TextStyle bodyLarge = TextStyle(
    color: cream,
    fontSize: 16,
    fontWeight: FontWeight.w500,
  );

  static const TextStyle bodyMedium = TextStyle(
    color: cream,
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );

  static const TextStyle bodySmall = TextStyle(
    color: muted,
    fontSize: 12,
  );

  static const TextStyle caption = TextStyle(
    color: muted,
    fontSize: 11,
    fontWeight: FontWeight.w500,
  );

  // Button Styles
  static ButtonStyle primaryButton = ElevatedButton.styleFrom(
    backgroundColor: gold,
    foregroundColor: bg,
    elevation: 0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    padding: const EdgeInsets.symmetric(vertical: 14),
  );

  static ButtonStyle secondaryButton = OutlinedButton.styleFrom(
    foregroundColor: gold,
    side: BorderSide(color: gold.withOpacity(0.4)),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    padding: const EdgeInsets.symmetric(vertical: 14),
  );

  static ButtonStyle iconButton = ElevatedButton.styleFrom(
    backgroundColor: card,
    foregroundColor: muted,
    elevation: 0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    padding: const EdgeInsets.all(12),
    minimumSize: const Size(44, 44),
  );

  // Input Decoration
  static InputDecoration inputDecoration({
    required String label,
    required IconData icon,
    Widget? suffix,
    String? hint,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      labelStyle: const TextStyle(color: muted, fontSize: 13),
      floatingLabelStyle: const TextStyle(color: gold, fontSize: 12),
      hintStyle: const TextStyle(color: muted),
      prefixIcon: Icon(icon, color: muted, size: 20),
      suffixIcon: suffix,
      filled: true,
      fillColor: card,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: gold, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: error, width: 1.5),
      ),
      errorStyle: const TextStyle(color: error, fontSize: 12),
    );
  }
}