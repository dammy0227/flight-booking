import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../constants/app_theme.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final String? seeAllRoute;
  final VoidCallback? onSeeAll;

  const SectionHeader({
    super.key,
    required this.title,
    this.seeAllRoute,
    this.onSeeAll,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppTheme.cream,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (seeAllRoute != null || onSeeAll != null)
            GestureDetector(
              onTap: onSeeAll ?? () => Get.toNamed(seeAllRoute!),
              child: const Row(
                children: [
                  Text(
                    'See All',
                    style: TextStyle(
                      color: AppTheme.gold,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(width: 3),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: AppTheme.gold,
                    size: 11,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}