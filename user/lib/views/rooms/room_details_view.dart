import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/room_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';

class RoomDetailsView extends StatefulWidget {
  const RoomDetailsView({super.key});

  @override
  State<RoomDetailsView> createState() => _RoomDetailsViewState();
}

class _RoomDetailsViewState extends State<RoomDetailsView> {
  final RoomController controller = Get.find<RoomController>();

  int _currentIndex = 0;
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = Get.arguments;

      if (args == null) {
        Get.snackbar(
          'Error',
          'Room ID missing',
          snackPosition: SnackPosition.TOP,
          backgroundColor: AppTheme.error,
          colorText: Colors.white,
        );
        Get.back();
        return;
      }

      String roomId;
      if (args["id"] != null) {
        roomId = args["id"].toString();
      } else if (args["roomId"] != null) {
        roomId = args["roomId"].toString();
      } else {
        Get.snackbar(
          'Error',
          'Room ID missing',
          snackPosition: SnackPosition.TOP,
          backgroundColor: AppTheme.error,
          colorText: Colors.white,
        );
        Get.back();
        return;
      }

      controller.selectedRoom.value = null;
      controller.fetchRoomById(roomId);
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
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
          "Room Details",
          style: TextStyle(color: AppTheme.cream),
        ),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
            ),
          );
        }

        final room = controller.selectedRoom.value;

        if (room == null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Icon(
                    Icons.king_bed_rounded,
                    size: 64,
                    color: AppTheme.muted.withOpacity(0.5),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  "Room not found",
                  style: TextStyle(
                    fontSize: 18,
                    color: AppTheme.muted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => Get.back(),
                  child: const Text(
                    "Go Back",
                    style: TextStyle(color: AppTheme.gold),
                  ),
                ),
              ],
            ),
          );
        }

        final isLowAvailability = room.availableRooms < 5;

        return AnimatedPage(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (room.images.isNotEmpty)
                  Column(
                    children: [
                      Stack(
                        children: [
                          SizedBox(
                            height: 300,
                            child: PageView.builder(
                              controller: _pageController,
                              itemCount: room.images.length,
                              onPageChanged: (index) {
                                setState(() {
                                  _currentIndex = index;
                                });
                              },
                              itemBuilder: (_, index) {
                                return Image.network(
                                  room.images[index],
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  errorBuilder: (_, _, __) => Container(
                                    color: AppTheme.bg,
                                    child: Center(
                                      child: Icon(
                                        Icons.broken_image,
                                        color: AppTheme.muted.withOpacity(0.5),
                                        size: 48,
                                      ),
                                    ),
                                  ),
                                );
                              },
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
                                border: Border.all(color: AppTheme.gold.withOpacity(0.3)),
                              ),
                              child: Text(
                                '${_currentIndex + 1} / ${room.images.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 16,
                            right: 16,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: isLowAvailability
                                    ? AppTheme.warning.withOpacity(0.9)
                                    : AppTheme.success.withOpacity(0.9),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${room.availableRooms} rooms left',
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
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(room.images.length, (index) {
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: _currentIndex == index ? 10 : 8,
                            height: _currentIndex == index ? 10 : 8,
                            decoration: BoxDecoration(
                              color: _currentIndex == index ? AppTheme.gold : AppTheme.muted,
                              shape: BoxShape.circle,
                            ),
                          );
                        }),
                      ),
                    ],
                  )
                else
                  Container(
                    height: 260,
                    color: AppTheme.card,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.king_bed_rounded,
                            size: 64,
                            color: AppTheme.gold.withOpacity(0.3),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            "No images available",
                            style: TextStyle(color: AppTheme.muted),
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),
                Container(
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
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
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  "\$${room.price}",
                                  style: const TextStyle(
                                    color: AppTheme.goldLt,
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const Text(
                                  "per night",
                                  style: TextStyle(
                                    color: AppTheme.muted,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.bg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.hotel, color: AppTheme.gold, size: 16),
                                  const SizedBox(width: 8),
                                  Text(
                                    room.hotelName,
                                    style: const TextStyle(
                                      color: AppTheme.cream,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.location_on, color: AppTheme.gold, size: 16),
                                  const SizedBox(width: 8),
                                  Text(
                                    room.hotelCity,
                                    style: const TextStyle(color: AppTheme.muted),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          "Room Features",
                          style: TextStyle(
                            color: AppTheme.cream,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: [
                            if (room.bedType != null)
                              _buildFeatureChip(
                                Icons.bed,
                                room.bedType!,
                              ),
                            if (room.maxOccupancy != null)
                              _buildFeatureChip(
                                Icons.people,
                                "${room.maxOccupancy} guests",
                              ),
                            if (room.view != null)
                              _buildFeatureChip(
                                Icons.view_agenda,
                                room.view!,
                              ),
                          ],
                        ),
                        if (room.description != null) ...[
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
                              color: AppTheme.bg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.border),
                            ),
                            child: Text(
                              room.description!,
                              style: const TextStyle(
                                color: AppTheme.muted,
                                height: 1.5,
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
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
                            style: AppTheme.primaryButton,
                            child: const Text(
                              "Book Now",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildFeatureChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.gold.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppTheme.gold, size: 14),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(color: AppTheme.gold, fontSize: 12),
          ),
        ],
      ),
    );
  }
}