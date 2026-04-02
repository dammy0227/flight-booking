import 'package:flutter/material.dart';
import 'package:get/get.dart';
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

class _HotelDetailsViewState extends State<HotelDetailsView> with SingleTickerProviderStateMixin {
  final HotelService hotelService = Get.find<HotelService>();

  Hotel? hotel;
  bool isLoading = true;
  String? hotelId;
  int selectedImage = 0;
  bool liked = false;
  bool showFullDesc = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    _animationController.forward();

    final args = Get.arguments;
    if (args is Map && args.containsKey('hotelId')) {
      hotelId = args['hotelId'].toString();
    } else if (args is String) {
      hotelId = args;
    }

    if (hotelId != null) {
      _fetchHotel();
    } else {
      Get.snackbar('Error', 'Hotel ID missing', snackPosition: SnackPosition.TOP);
      Get.back();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _fetchHotel() async {
    try {
      final result = await hotelService.getHotelById(hotelId!);
      setState(() {
        hotel = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      Get.snackbar('Error', e.toString());
    }
  }

  IconData _amenityIcon(String amenity) {
    final a = amenity.toLowerCase();
    if (a.contains('wifi')) return Icons.wifi;
    if (a.contains('breakfast') || a.contains('coffee')) return Icons.free_breakfast;
    if (a.contains('parking')) return Icons.local_parking;
    if (a.contains('pool')) return Icons.pool;
    if (a.contains('ac') || a.contains('air')) return Icons.ac_unit;
    if (a.contains('spa')) return Icons.spa;
    if (a.contains('gym') || a.contains('fitness')) return Icons.fitness_center;
    return Icons.people_outline;
  }

  void _viewRooms() {
    if (hotel == null) return;
    Get.toNamed(AppRoutes.rooms, arguments: {
      'hotelId': hotel!.id,
      'hotelName': hotel!.name,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: _buildAppBar(),
      body: _buildBody(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppTheme.card,
      elevation: 0,
      leading: const CustomBackButton(),
      title: const Text(
        'Hotel Details',
        style: TextStyle(color: AppTheme.cream, fontSize: 16, fontWeight: FontWeight.w600),
      ),
      centerTitle: true,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: AppTheme.border),
      ),
    );
  }

  Widget _buildBody() {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
        ),
      );
    }
    if (hotel == null) return _buildNotFound();
    return FadeTransition(
      opacity: _fadeAnimation,
      child: _buildContent(),
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
            const Icon(Icons.hotel_outlined, size: 64, color: AppTheme.muted),
            const SizedBox(height: 16),
            const Text(
              'Hotel not found',
              style: TextStyle(color: AppTheme.cream, fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            const Text(
              "The hotel you're looking for doesn't exist",
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
              child: const Text('Back to Hotels', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    final h = hotel!;
    final images = h.images;
    final isAvailable = h.roomsAvailable > 0;

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
                Text('Back to Hotels', style: TextStyle(color: AppTheme.muted, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildHeaderCard(h, isAvailable),
          const SizedBox(height: 16),
          _buildGalleryAndInfoRow(h, images),
          const SizedBox(height: 16),
          if (h.description != null && h.description!.isNotEmpty) _buildDescription(h),
          if (h.description != null && h.description!.isNotEmpty) const SizedBox(height: 16),
          if (h.amenities.isNotEmpty) _buildAmenities(h),
          if (h.amenities.isNotEmpty) const SizedBox(height: 16),
          _buildLocation(h),
          const SizedBox(height: 16),
          _buildCTA(isAvailable),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(Hotel h, bool isAvailable) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.card, AppTheme.cardDark],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        h.name,
                        style: const TextStyle(color: AppTheme.cream, fontSize: 20, fontWeight: FontWeight.w700),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () => setState(() => liked = !liked),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.cardDark,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Icon(
                          liked ? Icons.favorite : Icons.favorite_border,
                          size: 18,
                          color: liked ? AppTheme.gold : AppTheme.muted,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on, size: 14, color: AppTheme.muted),
                        const SizedBox(width: 4),
                        Text(h.city, style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
                      ],
                    ),
                    _ratingBadge(h.rating),
                    _availabilityBadge(h, isAvailable),
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('Price per night', style: TextStyle(color: AppTheme.muted, fontSize: 11)),
              Text(
                '\$${h.price.toStringAsFixed(0)}',
                style: const TextStyle(color: AppTheme.goldLt, fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _ratingBadge(double rating) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.gold.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.gold.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star, size: 12, color: AppTheme.gold),
          const SizedBox(width: 4),
          Text(
            rating.toStringAsFixed(1),
            style: const TextStyle(color: AppTheme.gold, fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _availabilityBadge(Hotel h, bool isAvailable) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: (isAvailable ? AppTheme.success : AppTheme.error).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: (isAvailable ? AppTheme.success : AppTheme.error).withOpacity(0.3),
        ),
      ),
      child: Text(
        isAvailable ? '${h.roomsAvailable} rooms available' : 'Sold Out',
        style: TextStyle(
          color: isAvailable ? AppTheme.success : AppTheme.error,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildGalleryAndInfoRow(Hotel h, List<HotelImage> images) {
    return LayoutBuilder(
      builder: (_, constraints) {
        final wide = constraints.maxWidth > 600;
        if (wide) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 2, child: _buildGallery(images)),
              const SizedBox(width: 16),
              SizedBox(width: 250, child: _buildInfoColumn(h)),
            ],
          );
        }
        return Column(
          children: [
            _buildGallery(images),
            const SizedBox(height: 16),
            _buildInfoColumn(h),
          ],
        );
      },
    );
  }

  Widget _buildGallery(List<HotelImage> images) {
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: images.isNotEmpty
              ? Image.network(
            images[selectedImage].url,
            height: 260,
            width: double.infinity,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _imagePlaceholder(260),
          )
              : _imagePlaceholder(260),
        ),
        if (images.length > 1) ...[
          const SizedBox(height: 12),
          SizedBox(
            height: 60,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: images.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) => GestureDetector(
                onTap: () => setState(() => selectedImage = i),
                child: Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: selectedImage == i ? AppTheme.gold : AppTheme.border,
                      width: 2,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      images[i].url,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(color: AppTheme.border),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _imagePlaceholder(double h) {
    return Container(
      height: h,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.gold.withOpacity(0.08),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Icon(Icons.hotel, size: 48, color: AppTheme.gold),
    );
  }

  Widget _buildInfoColumn(Hotel h) {
    return Column(
      children: [
        _buildQuickInfo(h),
        const SizedBox(height: 12),
        _buildSpecialOffer(),
      ],
    );
  }

  Widget _buildQuickInfo(Hotel h) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _infoRow(Icons.info_outline, 'Quick Info', isHeader: true),
          const SizedBox(height: 12),
          _infoRow(Icons.phone, h.phone ?? '+1 234 567 890'),
          const SizedBox(height: 8),
          _infoRow(Icons.email_outlined, h.email ?? 'info@hotel.com'),
          const SizedBox(height: 8),
          _infoRow(Icons.language, h.website ?? 'www.hotel.com'),
          const Divider(color: AppTheme.border, height: 16),
          _infoRow(Icons.access_time, 'Check-in: 2:00 PM • Check-out: 12:00 PM'),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text, {bool isHeader = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: AppTheme.gold),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: isHeader ? AppTheme.cream : AppTheme.muted,
              fontSize: isHeader ? 13 : 11,
              fontWeight: isHeader ? FontWeight.bold : FontWeight.normal,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildSpecialOffer() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.gold.withOpacity(0.1), Colors.transparent],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.emoji_events_outlined, size: 16, color: AppTheme.gold),
              SizedBox(width: 8),
              Text('Special Offer', style: TextStyle(color: AppTheme.cream, fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Book now and get 10% off on your first stay!',
            style: TextStyle(color: AppTheme.muted, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildDescription(Hotel h) {
    const limit = 200;
    final full = h.description!;
    final shouldTruncate = full.length > limit;
    final text = showFullDesc || !shouldTruncate ? full : '${full.substring(0, limit)}...';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDeco(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle(Icons.explore_outlined, 'About This Hotel'),
          const SizedBox(height: 12),
          Text(
            text,
            style: const TextStyle(color: AppTheme.muted, fontSize: 13, height: 1.6),
          ),
          if (shouldTruncate)
            GestureDetector(
              onTap: () => setState(() => showFullDesc = !showFullDesc),
              child: Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  showFullDesc ? 'Show less' : 'Read more',
                  style: const TextStyle(color: AppTheme.gold, fontSize: 12),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAmenities(Hotel h) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDeco(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle(Icons.shield_outlined, 'Amenities'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: h.amenities.map((amenity) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_amenityIcon(amenity), size: 14, color: AppTheme.gold),
                    const SizedBox(width: 6),
                    Text(amenity, style: const TextStyle(color: AppTheme.cream, fontSize: 12)),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildLocation(Hotel h) {
    return Container(
      decoration: _cardDeco(),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: _sectionTitle(Icons.location_on_outlined, 'Location'),
          ),
          Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.cardDark, AppTheme.card],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_on, size: 40, color: AppTheme.gold),
                const SizedBox(height: 8),
                Text(
                  h.name,
                  style: const TextStyle(color: AppTheme.cream, fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  '${h.city}, ${h.address}',
                  style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCTA(bool isAvailable) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.gold.withOpacity(0.1), Colors.transparent],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Book Your Stay', style: TextStyle(color: AppTheme.cream, fontSize: 15, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text('Explore available rooms and special rates', style: TextStyle(color: AppTheme.muted, fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton.icon(
            onPressed: isAvailable ? _viewRooms : null,
            icon: const Icon(Icons.vpn_key_outlined, size: 16),
            label: Text(isAvailable ? 'View Rooms' : 'Sold Out', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: isAvailable ? AppTheme.gold : AppTheme.border,
              foregroundColor: isAvailable ? AppTheme.bg : AppTheme.muted,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }

  BoxDecoration _cardDeco() {
    return BoxDecoration(
      color: AppTheme.card,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppTheme.border),
    );
  }

  Widget _sectionTitle(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.gold),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(color: AppTheme.cream, fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}