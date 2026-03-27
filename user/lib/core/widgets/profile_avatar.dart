import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../constants/app_theme.dart';

class ProfileAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double radius;
  final bool showBorder;

  const ProfileAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.radius = 20,
    this.showBorder = true,
  });

  @override
  Widget build(BuildContext context) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: AppTheme.card,
        backgroundImage: CachedNetworkImageProvider(imageUrl!),
        child: showBorder
            ? Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: AppTheme.gold,
              width: 2,
            ),
          ),
        )
            : null,
      );
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppTheme.gold.withOpacity(0.2),
      child: Text(
        _getInitials(name),
        style: TextStyle(
          color: AppTheme.gold,
          fontSize: radius * 0.8,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _getInitials(String name) {
    if (name.isEmpty) return 'U';
    final parts = name.trim().split(' ');
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }
}