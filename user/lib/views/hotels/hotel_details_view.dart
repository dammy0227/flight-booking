import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../services/hotel_service.dart';
import '../../models/hotel_model.dart';
import '../../core/constants/app_theme.dart';
import '../../routes/app_routes.dart';

class HotelDetailsView extends StatefulWidget {
  const HotelDetailsView({super.key});

  @override
  State<HotelDetailsView> createState() => _HotelDetailsViewState();
}

class _HotelDetailsViewState extends State<HotelDetailsView> {
  final HotelService hotelService = Get.find<HotelService>();

  Hotel? hotel;
  bool isLoading = true;
  String? hotelId;

  @override
  void initState() {
    super.initState();

    final args = Get.arguments;
    if (args != null) {
      if (args is Map && args.containsKey('hotelId')) {
        hotelId = args['hotelId'].toString();
      } else if (args is String) {
        hotelId = args;
      }
    }

    if (hotelId != null) {
      fetchHotel();
    } else {
      Get.snackbar("Error", "Hotel ID missing", snackPosition: SnackPosition.TOP);
      Get.back();
    }
  }

  Future<void> fetchHotel() async {
    if (hotelId == null) return;

    try {
      final result = await hotelService.getHotelById(hotelId!);
      setState(() {
        hotel = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      Get.snackbar("Error", e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        backgroundColor: AppTheme.card,
        elevation: 0,
        leading: const CustomBackButton(),
        title: const Text(
          "Hotel Details",
          style: TextStyle(color: AppTheme.cream),
        ),
        centerTitle: true,
      ),
      body: isLoading
          ? const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
        ),
      )
          : hotel == null
          ? Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.hotel_outlined,
              size: 64,
              color: AppTheme.muted,
            ),
            const SizedBox(height: 16),
            const Text(
              "Hotel not found",
              style: TextStyle(color: AppTheme.muted),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Get.back(),
              child: const Text("Go Back"),
            ),
          ],
        ),
      )
          : AnimatedPage(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (hotel!.images.isNotEmpty)
                Stack(
                  children: [
                    Image.network(
                      hotel!.images.first.url,
                      height: 250,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, __) => Container(
                        height: 250,
                        color: AppTheme.gold.withOpacity(0.1),
                        child: const Icon(
                          Icons.hotel,
                          size: 60,
                          color: AppTheme.gold,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.attach_money,
                              size: 14,
                              color: AppTheme.gold,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              hotel!.price.toStringAsFixed(0),
                              style: const TextStyle(
                                color: AppTheme.gold,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hotel!.name,
                      style: const TextStyle(
                        color: AppTheme.cream,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on,
                          size: 14,
                          color: AppTheme.muted,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            "${hotel!.city}, ${hotel!.address}",
                            style: const TextStyle(color: AppTheme.muted),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.gold.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: AppTheme.gold.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.star,
                                color: AppTheme.gold,
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                hotel!.rating.toStringAsFixed(1),
                                style: const TextStyle(
                                  color: AppTheme.gold,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: hotel!.roomsAvailable > 0
                                ? AppTheme.success.withOpacity(0.1)
                                : AppTheme.warning.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: hotel!.roomsAvailable > 0
                                  ? AppTheme.success.withOpacity(0.3)
                                  : AppTheme.warning.withOpacity(0.3),
                            ),
                          ),
                          child: Text(
                            hotel!.roomsAvailable > 0
                                ? '${hotel!.roomsAvailable} rooms left'
                                : 'Sold Out',
                            style: TextStyle(
                              color: hotel!.roomsAvailable > 0
                                  ? AppTheme.success
                                  : AppTheme.warning,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (hotel!.description != null) ...[
                      const SizedBox(height: 20),
                      const Text(
                        "Description",
                        style: TextStyle(
                          color: AppTheme.cream,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.card,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Text(
                          hotel!.description!,
                          style: const TextStyle(
                            color: AppTheme.muted,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                    if (hotel!.amenities.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      const Text(
                        "Amenities",
                        style: TextStyle(
                          color: AppTheme.cream,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: hotel!.amenities.map((amenity) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.bg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.border),
                            ),
                            child: Text(
                              amenity,
                              style: const TextStyle(
                                color: AppTheme.muted,
                                fontSize: 13,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                    const SizedBox(height: 30),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: hotel!.roomsAvailable > 0
                            ? () {
                          Get.toNamed(
                            AppRoutes.rooms,
                            arguments: {
                              "hotelId": hotel!.id,
                              "hotelName": hotel!.name,
                            },
                          );
                        }
                            : null,
                        style: AppTheme.primaryButton.copyWith(
                          padding: const WidgetStatePropertyAll(
                            EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                        child: Text(
                          hotel!.roomsAvailable > 0
                              ? "View Available Rooms"
                              : "Sold Out",
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}