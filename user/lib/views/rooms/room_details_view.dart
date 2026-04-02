import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/room_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../models/room_model.dart';

class RoomDetailsView extends StatefulWidget {
  const RoomDetailsView({super.key});

  @override
  State<RoomDetailsView> createState() => _RoomDetailsViewState();
}

class _RoomDetailsViewState extends State<RoomDetailsView> {
  final RoomController controller = Get.find<RoomController>();

  int _currentIndex = 0;
  int _selectedQty = 1;
  bool _imageModalOpen = false;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = Get.arguments;
      if (args == null) {
        _argError();
        return;
      }

      final String? roomId = (args['id'] ?? args['roomId'])?.toString();
      if (roomId == null) {
        _argError();
        return;
      }

      controller.selectedRoom.value = null;
      controller.fetchRoomById(roomId);
    });
  }

  void _argError() {
    Get.snackbar(
      'Error',
      'Room ID missing',
      snackPosition: SnackPosition.TOP,
      backgroundColor: AppTheme.error,
      colorText: Colors.white,
    );
    Get.back();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  IconData _amenityIcon(String amenity) {
    final a = amenity.toLowerCase();
    if (a.contains('wifi')) return Icons.wifi;
    if (a.contains('breakfast')) return Icons.free_breakfast;
    if (a.contains('ac') || a.contains('air')) return Icons.ac_unit;
    if (a.contains('pool')) return Icons.pool;
    if (a.contains('spa')) return Icons.spa;
    if (a.contains('gym') || a.contains('fitness')) return Icons.fitness_center;
    if (a.contains('tv') || a.contains('television')) return Icons.tv;
    if (a.contains('mini bar')) return Icons.local_bar;
    if (a.contains('safe')) return Icons.security;
    return Icons.info_outline;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: _buildAppBar(),
      body: Obx(() {
        if (controller.isLoading.value) return _buildLoader();
        final room = controller.selectedRoom.value;
        if (room == null) return _buildNotFound();

        return Stack(
          children: [
            AnimatedPage(
              child: _buildContent(room),
            ),
            if (_imageModalOpen) _buildImageModal(room),
          ],
        );
      }),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppTheme.card,
      elevation: 0,
      leading: const CustomBackButton(),
      title: const Text(
        'Room Details',
        style: TextStyle(color: AppTheme.cream, fontSize: 16, fontWeight: FontWeight.w600),
      ),
      centerTitle: true,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: AppTheme.border),
      ),
    );
  }

  Widget _buildLoader() {
    return const Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
      ),
    );
  }

  Widget _buildNotFound() {
    return Center(
      child: Container(
        margin: const EdgeInsets.all(24),
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.king_bed_outlined, size: 64, color: AppTheme.muted),
            const SizedBox(height: 16),
            const Text(
              'Room not found',
              style: TextStyle(color: AppTheme.cream, fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            const Text(
              "The room you're looking for doesn't exist",
              style: TextStyle(color: AppTheme.muted, fontSize: 13),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Get.back(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.gold,
                foregroundColor: AppTheme.bg,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Back to Rooms', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(Room room) {
    final images = room.images;
    final hasImages = images.isNotEmpty;
    final available = room.availableRooms;
    final isLow = available > 0 && available < 5;
    final isSoldOut = available < 1;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: () => Get.back(),
            child: Row(
              children: const [
                Icon(Icons.arrow_back, size: 16, color: AppTheme.muted),
                SizedBox(width: 6),
                Text('Back to Rooms', style: TextStyle(color: AppTheme.muted, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildTwoColumnRow(room, images, hasImages, available, isLow, isSoldOut),
          const SizedBox(height: 16),
          if (room.description != null && room.description!.isNotEmpty)
            _buildDescriptionSection(room),
          if (room.amenities.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildAmenitiesSection(room),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildTwoColumnRow(Room room, List<String> images, bool hasImages, int available, bool isLow, bool isSoldOut) {
    return LayoutBuilder(
      builder: (_, constraints) {
        final wide = constraints.maxWidth > 600;
        if (wide) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 2, child: _buildGallery(images, hasImages, available, isLow, isSoldOut)),
              const SizedBox(width: 16),
              SizedBox(width: 280, child: _buildBookingCard(room, available, isSoldOut)),
            ],
          );
        }
        return Column(
          children: [
            _buildGallery(images, hasImages, available, isLow, isSoldOut),
            const SizedBox(height: 16),
            _buildBookingCard(room, available, isSoldOut),
          ],
        );
      },
    );
  }

  Widget _buildGallery(List<String> images, bool hasImages, int available, bool isLow, bool isSoldOut) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Stack(
              children: [
                hasImages
                    ? SizedBox(
                  height: 280,
                  child: PageView.builder(
                    controller: _pageController,
                    itemCount: images.length,
                    onPageChanged: (i) => setState(() => _currentIndex = i),
                    itemBuilder: (_, i) => Image.network(
                      images[i],
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorBuilder: (_, __, ___) => _imgPlaceholder(280),
                    ),
                  ),
                )
                    : _imgPlaceholder(280),
                if (hasImages && images.length > 1)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${_currentIndex + 1} / ${images.length}',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                if (hasImages)
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: GestureDetector(
                      onTap: () => setState(() => _imageModalOpen = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.fullscreen, size: 14, color: Colors.white),
                            SizedBox(width: 4),
                            Text('Full Screen', style: TextStyle(color: Colors.white, fontSize: 11)),
                          ],
                        ),
                      ),
                    ),
                  ),
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: isSoldOut
                          ? AppTheme.error.withOpacity(0.9)
                          : isLow
                          ? AppTheme.warning.withOpacity(0.9)
                          : AppTheme.success.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.vpn_key_outlined, size: 10, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          isSoldOut
                              ? 'Sold Out'
                              : '$available ${available == 1 ? 'room' : 'rooms'} available',
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ),
                if (hasImages && images.length > 1) ...[
                  _arrowBtn(left: true, onTap: () {
                    final prev = (_currentIndex - 1 + images.length) % images.length;
                    _pageController.animateToPage(
                      prev,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.ease,
                    );
                  }),
                  _arrowBtn(left: false, onTap: () {
                    final next = (_currentIndex + 1) % images.length;
                    _pageController.animateToPage(
                      next,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.ease,
                    );
                  }),
                ],
              ],
            ),
          ),
          if (hasImages && images.length > 1)
            Padding(
              padding: const EdgeInsets.all(12),
              child: SizedBox(
                height: 60,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: images.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => GestureDetector(
                    onTap: () {
                      _pageController.animateToPage(
                        i,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.ease,
                      );
                    },
                    child: Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: _currentIndex == i ? AppTheme.gold : AppTheme.border,
                          width: 2,
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          images[i],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(color: AppTheme.border),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _imgPlaceholder(double h) {
    return Container(
      height: h,
      width: double.infinity,
      color: AppTheme.cardDark,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.king_bed_rounded, size: 56, color: AppTheme.gold.withOpacity(0.3)),
          const SizedBox(height: 8),
          const Text('No images available', style: TextStyle(color: AppTheme.muted, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _arrowBtn({required bool left, required VoidCallback onTap}) {
    return Positioned(
      left: left ? 10 : null,
      right: left ? null : 10,
      top: 0,
      bottom: 0,
      child: Center(
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.55),
              shape: BoxShape.circle,
            ),
            child: Icon(
              left ? Icons.chevron_left : Icons.chevron_right,
              color: Colors.white,
              size: 22,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBookingCard(Room room, int available, bool isSoldOut) {
    final price = room.price;
    final totalPrice = price * _selectedQty;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1C2438), Color(0xFF141B2B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            room.roomType,
            style: const TextStyle(color: AppTheme.cream, fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.location_on, size: 13, color: AppTheme.muted),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  '${room.hotelName}, ${room.hotelCity}',
                  style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.cardDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Price per night', style: TextStyle(color: AppTheme.muted, fontSize: 12)),
                    Row(
                      children: const [
                        Icon(Icons.star, size: 12, color: AppTheme.gold),
                        SizedBox(width: 3),
                        Text('4.8', style: TextStyle(color: AppTheme.cream, fontSize: 12, fontWeight: FontWeight.w600)),
                        SizedBox(width: 3),
                        Text('(128)', style: TextStyle(color: AppTheme.muted, fontSize: 11)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${price.toStringAsFixed(0)}',
                      style: const TextStyle(color: AppTheme.goldLt, fontSize: 28, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(width: 4),
                    const Padding(
                      padding: EdgeInsets.only(bottom: 4),
                      child: Text('/ night', style: TextStyle(color: AppTheme.muted, fontSize: 12)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _buildFeatureGrid(room),
          const SizedBox(height: 14),
          if (!isSoldOut) ...[
            const Text('Number of Rooms', style: TextStyle(color: AppTheme.muted, fontSize: 12)),
            const SizedBox(height: 8),
            Row(
              children: [
                _qtyBtn(Icons.remove, () {
                  if (_selectedQty > 1) setState(() => _selectedQty--);
                }, _selectedQty <= 1),
                const SizedBox(width: 12),
                Text('$_selectedQty', style: const TextStyle(color: AppTheme.cream, fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(width: 12),
                _qtyBtn(Icons.add, () {
                  if (_selectedQty < available) setState(() => _selectedQty++);
                }, _selectedQty >= available),
                const Spacer(),
                Text('$available available', style: const TextStyle(color: AppTheme.muted, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total for $_selectedQty night${_selectedQty > 1 ? 's' : ''}',
                    style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                  ),
                  Text(
                    '\$${totalPrice.toStringAsFixed(2)}',
                    style: const TextStyle(color: AppTheme.goldLt, fontSize: 20, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isSoldOut ? null : () => _handleBookRoom(room, totalPrice),
              style: ElevatedButton.styleFrom(
                backgroundColor: isSoldOut ? AppTheme.border : AppTheme.gold,
                foregroundColor: isSoldOut ? AppTheme.muted : AppTheme.bg,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: Text(
                isSoldOut
                    ? 'Sold Out'
                    : 'Book Now — \$${totalPrice.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback onTap, bool disabled) {
    return GestureDetector(
      onTap: disabled ? null : onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: AppTheme.cardDark,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.border),
        ),
        child: Icon(icon, size: 18, color: disabled ? AppTheme.muted.withOpacity(0.4) : AppTheme.cream),
      ),
    );
  }

  Widget _buildFeatureGrid(Room room) {
    final items = <Map<String, dynamic>>[
      if (room.bedType != null && room.bedType!.isNotEmpty)
        {'icon': Icons.bed_outlined, 'label': 'Bed Type', 'value': room.bedType},
      if (room.maxOccupancy != null)
        {'icon': Icons.people_outline, 'label': 'Max Guests', 'value': '${room.maxOccupancy}'},
      if (room.view != null && room.view!.isNotEmpty)
        {'icon': Icons.visibility_outlined, 'label': 'View', 'value': room.view},
      {'icon': Icons.access_time, 'label': 'Check-in', 'value': '2:00 PM'},
    ];

    if (items.isEmpty) return const SizedBox.shrink();

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      childAspectRatio: 2.8,
      children: items.map((item) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: AppTheme.cardDark,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppTheme.border),
          ),
          child: Row(
            children: [
              Icon(item['icon'] as IconData, size: 15, color: AppTheme.gold),
              const SizedBox(width: 6),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(item['label'] as String, style: const TextStyle(color: AppTheme.muted, fontSize: 9)),
                    Text(
                      item['value'] as String,
                      style: const TextStyle(color: AppTheme.cream, fontSize: 11, fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDescriptionSection(Room room) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1C2438), Color(0xFF141B2B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.info_outline, size: 16, color: AppTheme.gold),
              SizedBox(width: 8),
              Text('Description', style: TextStyle(color: AppTheme.cream, fontSize: 15, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.cardDark,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              room.description!,
              style: const TextStyle(color: AppTheme.muted, fontSize: 13, height: 1.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenitiesSection(Room room) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1C2438), Color(0xFF141B2B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.check_circle_outline, size: 16, color: AppTheme.gold),
              SizedBox(width: 8),
              Text(
                'Amenities',
                style: TextStyle(color: AppTheme.cream, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 3,
            children: room.amenities.map((amenity) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  children: [
                    Icon(_amenityIcon(amenity), color: AppTheme.gold, size: 14),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        amenity,
                        style: const TextStyle(color: AppTheme.cream, fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildImageModal(Room room) {
    final images = room.images;
    return GestureDetector(
      onTap: () => setState(() => _imageModalOpen = false),
      child: Container(
        color: Colors.black.withOpacity(0.95),
        child: Stack(
          children: [
            Center(
              child: GestureDetector(
                onTap: () {},
                child: Image.network(
                  images[_currentIndex],
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Icon(Icons.broken_image, color: AppTheme.muted, size: 64),
                ),
              ),
            ),
            Positioned(
              top: 48,
              right: 20,
              child: GestureDetector(
                onTap: () => setState(() => _imageModalOpen = false),
                child: const Icon(Icons.close, color: Colors.white, size: 28),
              ),
            ),
            if (images.length > 1) ...[
              _modalArrow(left: true, onTap: () {
                setState(() {
                  _currentIndex = (_currentIndex - 1 + images.length) % images.length;
                });
                _pageController.jumpToPage(_currentIndex);
              }),
              _modalArrow(left: false, onTap: () {
                setState(() {
                  _currentIndex = (_currentIndex + 1) % images.length;
                });
                _pageController.jumpToPage(_currentIndex);
              }),
            ],
          ],
        ),
      ),
    );
  }

  Widget _modalArrow({required bool left, required VoidCallback onTap}) {
    return Positioned(
      left: left ? 16 : null,
      right: left ? null : 16,
      top: 0,
      bottom: 0,
      child: Center(
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              left ? Icons.chevron_left : Icons.chevron_right,
              color: Colors.white,
              size: 28,
            ),
          ),
        ),
      ),
    );
  }

  void _handleBookRoom(Room room, double totalPrice) {
    Get.toNamed('/booking', arguments: {
      'type': 'room',
      'referenceId': room.id,
      'price': room.price,
      'quantity': _selectedQty,
      'totalPrice': totalPrice,
      'roomDetails': {
        'roomType': room.roomType,
        'hotelName': room.hotelName,
        'hotelCity': room.hotelCity,
        'bedType': room.bedType,
        'maxOccupancy': room.maxOccupancy,
        'view': room.view,
      },
    });
  }
}