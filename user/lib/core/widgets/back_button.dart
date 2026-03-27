import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../constants/app_theme.dart';

class CustomBackButton extends StatelessWidget {
  final VoidCallback? onPressed;

  const CustomBackButton({super.key, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed ?? () => Get.back(),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.muted, size: 16),
      ),
    );
  }
}