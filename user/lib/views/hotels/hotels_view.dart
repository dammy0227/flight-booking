import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../services/hotel_service.dart';
import '../../models/hotel_model.dart';
import '../../core/constants/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../routes/app_routes.dart';

class HotelsView extends StatefulWidget {
  const HotelsView({super.key});

  @override
  State<HotelsView> createState() => _HotelsViewState();
}

class _HotelsViewState extends State<HotelsView> {
  final HotelService hotelService = Get.find<HotelService>();

  List<Hotel> hotels = [];
  List<Hotel> filteredHotels = [];
  bool isLoading = true;
  bool isSearching = false;

  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchHotels();
    searchController.addListener(_filterHotels);
  }

  @override
  void dispose() {
    searchController.removeListener(_filterHotels);
    searchController.dispose();
    super.dispose();
  }

  Future<void> fetchHotels() async {
    setState(() => isLoading = true);
    try {
      final result = await hotelService.getHotels();
      setState(() {
        hotels = result;
        filteredHotels = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      Get.snackbar("Error", e.toString());
    }
  }

  void _filterHotels() {
    final query = searchController.text.toLowerCase().trim();
    setState(() {
      if (query.isEmpty) {
        filteredHotels = hotels;
        isSearching = false;
      } else {
        filteredHotels = hotels.where((hotel) {
          return hotel.name.toLowerCase().contains(query) ||
              hotel.city.toLowerCase().contains(query) ||
              hotel.address.toLowerCase().contains(query);
        }).toList();
        isSearching = true;
      }
    });
  }

  void _clearSearch() {
    searchController.clear();
    FocusScope.of(context).unfocus();
    setState(() {
      filteredHotels = hotels;
      isSearching = false;
    });
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
          "Luxury Hotels",
          style: TextStyle(
            color: AppTheme.cream,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_alt, color: AppTheme.gold),
            onPressed: () => _showFilterDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: searchController,
                style: const TextStyle(color: AppTheme.cream, fontSize: 16),
                cursorColor: AppTheme.gold,
                decoration: InputDecoration(
                  hintText: "Search hotels by name or city...",
                  hintStyle: TextStyle(color: AppTheme.muted, fontSize: 14),
                  prefixIcon: const Icon(Icons.search, color: AppTheme.gold, size: 22),
                  suffixIcon: searchController.text.isNotEmpty
                      ? IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.muted),
                    onPressed: _clearSearch,
                  )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ),
          if (filteredHotels.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isSearching ? 'Search Results' : 'Recommended for you',
                    style: TextStyle(
                      color: AppTheme.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    '${filteredHotels.length} hotels',
                    style: TextStyle(
                      color: AppTheme.gold,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 8),
          Expanded(
            child: isLoading
                ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
              ),
            )
                : filteredHotels.isEmpty
                ? EmptyState(
              title: 'No hotels found',
              subtitle: 'Try searching with different keywords',
              icon: Icons.hotel_outlined,
              buttonText: 'Clear Search',
              onButtonPressed: () {
                _clearSearch();
                fetchHotels();
              },
            )
                : AnimatedPage(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: filteredHotels.length,
                itemBuilder: (context, index) {
                  final hotel = filteredHotels[index];
                  return _buildHotelCard(hotel);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHotelCard(Hotel hotel) {
    final imageUrl = hotel.images.isNotEmpty ? hotel.images.first.url : null;
    final isAvailable = hotel.roomsAvailable > 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () {
            // 🔥 FIX: Pass hotelId to the details view
            Get.toNamed(
              AppRoutes.hotelsDetails,
              arguments: {"hotelId": hotel.id},
            );
          },
          child: Container(
            decoration: BoxDecoration(
              color: AppTheme.card,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.border.withOpacity(0.5)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(24),
                      ),
                      child: imageUrl != null
                          ? Image.network(
                        imageUrl,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, __) => Container(
                          height: 200,
                          color: AppTheme.gold.withOpacity(0.1),
                          child: const Icon(
                            Icons.hotel,
                            size: 60,
                            color: AppTheme.gold,
                          ),
                        ),
                      )
                          : Container(
                        height: 200,
                        color: AppTheme.gold.withOpacity(0.1),
                        child: const Icon(
                          Icons.hotel,
                          size: 60,
                          color: AppTheme.gold,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [AppTheme.gold, AppTheme.goldLt],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.3),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.attach_money,
                              size: 16,
                              color: AppTheme.bg,
                            ),
                            Text(
                              hotel.price.toStringAsFixed(0),
                              style: const TextStyle(
                                color: AppTheme.bg,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.bg.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.gold.withOpacity(0.5)),
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
                              hotel.rating.toStringAsFixed(1),
                              style: const TextStyle(
                                color: AppTheme.cream,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isAvailable
                              ? AppTheme.success.withOpacity(0.9)
                              : AppTheme.warning.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          isAvailable
                              ? '${hotel.roomsAvailable} rooms left'
                              : 'Sold Out',
                          style: TextStyle(
                            color: AppTheme.bg,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
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
                        hotel.name,
                        style: const TextStyle(
                          color: AppTheme.cream,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on,
                            color: AppTheme.muted,
                            size: 14,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              "${hotel.city}, ${hotel.address}",
                              style: const TextStyle(
                                color: AppTheme.muted,
                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      if (hotel.amenities.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: hotel.amenities.take(3).map((amenity) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.bg,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppTheme.border),
                              ),
                              child: Text(
                                amenity,
                                style: const TextStyle(
                                  color: AppTheme.muted,
                                  fontSize: 10,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            // 🔥 FIX: Pass hotelId to the details view
                            Get.toNamed(
                              AppRoutes.hotelsDetails,
                              arguments: {"hotelId": hotel.id},
                            );
                          },
                          style: AppTheme.primaryButton.copyWith(
                            padding: const WidgetStatePropertyAll(
                              EdgeInsets.symmetric(vertical: 12),
                            ),
                            shape: const WidgetStatePropertyAll(
                              RoundedRectangleBorder(
                                borderRadius: BorderRadius.vertical(
                                  top: Radius.circular(12),
                                  bottom: Radius.circular(12),
                                ),
                              ),
                            ),
                          ),
                          child: const Text(
                            "View Details",
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Filter Hotels",
                  style: TextStyle(
                    color: AppTheme.cream,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppTheme.muted),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              "Coming soon...",
              style: TextStyle(color: AppTheme.muted),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: AppTheme.primaryButton.copyWith(
                minimumSize: const WidgetStatePropertyAll(Size(double.infinity, 48)),
                shape: WidgetStatePropertyAll(
                  RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              child: const Text("Apply Filters"),
            ),
          ],
        ),
      ),
    );
  }
}