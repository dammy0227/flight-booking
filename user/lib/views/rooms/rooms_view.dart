import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/room_controller.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../models/room_model.dart';
import '../../core/constants/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../routes/app_routes.dart';

class RoomsView extends StatefulWidget {
  const RoomsView({super.key});

  @override
  State<RoomsView> createState() => _RoomsViewState();
}

class _RoomsViewState extends State<RoomsView> {
  final RoomController controller = Get.find<RoomController>();

  String hotelId = "";
  String hotelName = "";

  @override
  void initState() {
    super.initState();

    final args = Get.arguments ?? {};
    hotelId = args["hotelId"] ?? "";
    hotelName = args["hotelName"] ?? "";

    controller.fetchRooms(hotelId: hotelId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        backgroundColor: AppTheme.card,
        elevation: 0,
        title: Text(
          hotelName.isNotEmpty ? hotelName : 'Rooms',
          style: const TextStyle(color: AppTheme.cream),
        ),
        centerTitle: true,
        leading: const CustomBackButton(),
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
            ),
          );
        }

        if (controller.rooms.isEmpty) {
          return EmptyState(
            title: 'No rooms available',
            subtitle: 'No rooms found for this hotel',
            icon: Icons.king_bed_rounded,
          );
        }

        return AnimatedPage(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.rooms.length,
            itemBuilder: (context, index) {
              final room = controller.rooms[index];
              return _buildRoomCard(room);
            },
          ),
        );
      }),
    );
  }

  Widget _buildRoomCard(Room room) {
    final isLowAvailability = room.availableRooms < 5;
    final imageUrl = room.images.isNotEmpty ? room.images.first : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (room.id.isNotEmpty) {
              Get.toNamed(
                AppRoutes.roomsDetails,
                arguments: {"id": room.id},
              );
            }
          },
          borderRadius: BorderRadius.circular(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Stack(
                  children: [
                    if (imageUrl != null)
                      Image.network(
                        imageUrl,
                        height: 180,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(
                          height: 180,
                          color: AppTheme.bg,
                          child: Center(
                            child: Icon(
                              Icons.broken_image,
                              color: AppTheme.muted.withOpacity(0.5),
                              size: 48,
                            ),
                          ),
                        ),
                      )
                    else
                      Container(
                        height: 180,
                        color: AppTheme.bg,
                        child: Center(
                          child: Icon(
                            Icons.king_bed_rounded,
                            color: AppTheme.gold.withOpacity(0.3),
                            size: 64,
                          ),
                        ),
                      ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isLowAvailability
                              ? AppTheme.warning.withOpacity(0.9)
                              : AppTheme.success.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${room.availableRooms} left',
                          style: TextStyle(
                            color: isLowAvailability ? AppTheme.bg : AppTheme.cream,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            room.roomType,
                            style: const TextStyle(
                              color: AppTheme.cream,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              "\$${room.price}",
                              style: const TextStyle(
                                color: AppTheme.goldLt,
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const Text(
                              "/night",
                              style: TextStyle(
                                color: AppTheme.muted,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.location_on_rounded, color: AppTheme.muted, size: 14),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            "${room.hotelName}, ${room.hotelCity}",
                            style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      runSpacing: 8,
                      children: [
                        if (room.bedType != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.gold.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.bed, color: AppTheme.gold, size: 12),
                                const SizedBox(width: 4),
                                Text(
                                  room.bedType!,
                                  style: const TextStyle(color: AppTheme.gold, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        if (room.maxOccupancy != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.gold.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.people, color: AppTheme.gold, size: 12),
                                const SizedBox(width: 4),
                                Text(
                                  "${room.maxOccupancy} guests",
                                  style: const TextStyle(color: AppTheme.gold, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        if (room.view != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.gold.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.view_agenda, color: AppTheme.gold, size: 12),
                                const SizedBox(width: 4),
                                Text(
                                  room.view!,
                                  style: const TextStyle(color: AppTheme.gold, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              if (room.id.isNotEmpty) {
                                Get.toNamed(
                                  AppRoutes.roomsDetails,
                                  arguments: {"id": room.id},
                                );
                              }
                            },
                            style: AppTheme.secondaryButton.copyWith(
                              shape: WidgetStatePropertyAll(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              padding: const WidgetStatePropertyAll(
                                EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                            child: const Text('Details'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              Get.toNamed('/booking', arguments: {
                                'type': 'room',
                                'referenceId': room.id,
                                'price': room.price,
                                'quantity': 1,
                                'totalPrice': room.price,
                                'roomDetails': {
                                  'roomType': room.roomType,
                                  'hotelName': room.hotelName,
                                  'hotelCity': room.hotelCity,
                                  'bedType': room.bedType,
                                  'maxOccupancy': room.maxOccupancy,
                                  'view': room.view,
                                },
                              });
                            },
                            style: AppTheme.primaryButton.copyWith(
                              shape: WidgetStatePropertyAll(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              padding: const WidgetStatePropertyAll(
                                EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                            child: const Text(
                              'Book',
                              style: TextStyle(fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                      ],
                    ),
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