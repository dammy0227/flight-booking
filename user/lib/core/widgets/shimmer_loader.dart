import 'package:flutter/material.dart';
import '../constants/app_theme.dart';

class ShimmerLoader extends StatelessWidget {
  final double height;
  final double? width;

  const ShimmerLoader({super.key, required this.height, this.width});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 14),
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
    );
  }
}