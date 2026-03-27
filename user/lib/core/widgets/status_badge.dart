import 'package:flutter/material.dart';
import '../constants/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool isPaid;
  final bool isConfirmed;

  const StatusBadge({
    super.key,
    required this.status,
    this.isPaid = false,
    this.isConfirmed = false,
  });

  @override
  Widget build(BuildContext context) {
    Color color;
    if (isPaid || status.toLowerCase() == 'paid' || status.toLowerCase() == 'confirmed') {
      color = AppTheme.success;
    } else if (status.toLowerCase() == 'pending') {
      color = AppTheme.warning;
    } else if (status.toLowerCase() == 'cancelled') {
      color = AppTheme.error;
    } else {
      color = AppTheme.muted;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 10,
        ),
      ),
    );
  }
}