import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/booking_controller.dart';
import '../../controllers/flight_controller.dart';
import '../../controllers/hotel_controller.dart';
import '../../controllers/room_controller.dart';
import '../../controllers/user_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/section_header.dart';
import '../../core/widgets/shimmer_loader.dart';
import '../../core/widgets/status_badge.dart';
import '../../core/widgets/profile_avatar.dart';
import '../../models/flight_model.dart';
import '../../models/hotel_model.dart';
import '../../models/booking_model.dart';
import '../../routes/app_routes.dart';
import '../bookings/booking_details_view.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> with SingleTickerProviderStateMixin {
  final AuthController _auth = Get.find<AuthController>();
  final FlightController _flights = Get.find<FlightController>();
  final HotelController _hotels = Get.find<HotelController>();
  final BookingController _bookings = Get.find<BookingController>();
  final RoomController _rooms = Get.find<RoomController>();
  final UserController _user = Get.find<UserController>();

  late final TabController _tabController;
  final TextEditingController _searchCtrl = TextEditingController();
  final FocusNode _searchFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(_onTabChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadInitialData());
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    _searchCtrl.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) return;
    if (_tabController.index == 3) {
      final uid = _auth.user.value?.id;
      if (uid != null) {
        _bookings.fetchUserBookings();
      }
    }
  }

  Future<void> _loadInitialData() async {
    try {
      await Future.wait([
        _flights.fetchFlights(),
        _hotels.fetchHotels(sortBy: 'rating', sortOrder: 'desc'),
        _rooms.fetchRooms(),
      ]);
      final uid = _auth.user.value?.id;
      if (uid != null) {
        await Future.wait([
          _bookings.fetchUserBookings(),
          _user.fetchProfile(uid),
        ]);
      }
    } catch (e) {
      debugPrint('HomeView load error: $e');
    }
  }

  void _navigateTo(String route, {Map<String, dynamic>? arguments}) {
    Get.toNamed(route, arguments: arguments);
  }

  void _onSearch() {
    _searchFocus.unfocus();
    final q = _searchCtrl.text.trim();
    if (q.isNotEmpty) _navigateTo(AppRoutes.flights, arguments: {'search': q});
  }

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: _appBar(),
      body: TabBarView(
        controller: _tabController,
        children: [
          _flightsTab(),
          _hotelsTab(),
          _roomsTab(),
          _bookingsTab(),
        ],
      ),
    );
  }

  AppBar _appBar() => AppBar(
    backgroundColor: AppTheme.card,
    elevation: 0,
    toolbarHeight: 70,
    automaticallyImplyLeading: false,
    title: Row(children: [
      Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppTheme.gold.withOpacity(0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.gold.withOpacity(0.3)),
        ),
        child: const Icon(Icons.flight_takeoff_rounded, color: AppTheme.gold, size: 22),
      ),
      const SizedBox(width: 12),
      RichText(
        text: TextSpan(children: [
          TextSpan(
            text: '123 ',
            style: TextStyle(
              color: AppTheme.cream,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: 1,
            ),
          ),
          TextSpan(
            text: 'RESERVE',
            style: TextStyle(
              color: AppTheme.gold,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: 1,
            ),
          ),
        ]),
      ),
    ]),
    actions: [
      GestureDetector(
        onTap: () => _navigateTo(AppRoutes.profile),
        child: Obx(() {
          final user = _auth.user.value;
          return Padding(
            padding: const EdgeInsets.only(right: 16),
            child: ProfileAvatar(
              imageUrl: user?.image,
              name: user?.name ?? 'User',
              radius: 18,
              showBorder: true,
            ),
          );
        }),
      ),
    ],
    bottom: PreferredSize(
      preferredSize: const Size.fromHeight(56),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
        decoration: BoxDecoration(
          color: AppTheme.bg,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: AppTheme.border),
        ),
        child: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            color: AppTheme.gold,
          ),
          labelColor: AppTheme.bg,
          unselectedLabelColor: AppTheme.muted,
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          tabs: const [
            Tab(text: 'Flights'),
            Tab(text: 'Hotels'),
            Tab(text: 'Rooms'),
            Tab(text: 'Bookings'),
          ],
        ),
      ),
    ),
  );

  Widget _hero() => Obx(() {
    final user = _auth.user.value;
    final name = (user?.name.isNotEmpty == true)
        ? user!.name.split(' ').first
        : 'Traveller';
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_greeting, style: const TextStyle(color: AppTheme.muted, fontSize: 14)),
          const SizedBox(height: 4),
          Text(
            'Hello, $name 👋',
            style: const TextStyle(
              color: AppTheme.cream,
              fontSize: 26,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Discover your next adventure',
            style: TextStyle(color: AppTheme.muted, fontSize: 14),
          ),
        ],
      ),
    );
  });

  Widget _searchBar() => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
    child: Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: TextField(
        controller: _searchCtrl,
        focusNode: _searchFocus,
        style: const TextStyle(color: AppTheme.cream, fontSize: 14),
        cursorColor: AppTheme.gold,
        decoration: InputDecoration(
          hintText: 'Search flights, hotels…',
          hintStyle: const TextStyle(color: AppTheme.muted),
          prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.gold, size: 20),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: AppTheme.card,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
        onSubmitted: (_) => _onSearch(),
      ),
    ),
  );

  Widget _categories() {
    final cats = [
      {'icon': Icons.flight_takeoff_rounded, 'label': 'Flights', 'color': AppTheme.gold, 'route': AppRoutes.flights},
      {'icon': Icons.hotel_rounded, 'label': 'Hotels', 'color': const Color(0xFF4CAF50), 'route': AppRoutes.hotels},
      {'icon': Icons.king_bed_rounded, 'label': 'Rooms', 'color': const Color(0xFF9C27B0), 'route': AppRoutes.rooms},
      {'icon': Icons.receipt_long_rounded, 'label': 'Bookings', 'color': const Color(0xFF2196F3), 'route': AppRoutes.bookingHistory},
    ];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: cats.map((c) => GestureDetector(
          onTap: () => _navigateTo(c['route'] as String),
          child: Column(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: (c['color'] as Color).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: (c['color'] as Color).withOpacity(0.3)),
                ),
                child: Icon(c['icon'] as IconData, color: c['color'] as Color, size: 26),
              ),
              const SizedBox(height: 6),
              Text(
                c['label'] as String,
                style: const TextStyle(color: AppTheme.muted, fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        )).toList(),
      ),
    );
  }

  Widget _skeleton({double height = 130}) => ShimmerLoader(height: height);

  Widget _empty(String msg) => EmptyState(
    title: msg,
    icon: Icons.inbox_rounded,
  );

  Widget _flightsTab() => CustomScrollView(
    physics: const BouncingScrollPhysics(),
    slivers: [
      SliverToBoxAdapter(child: _hero()),
      SliverToBoxAdapter(child: _searchBar()),
      SliverToBoxAdapter(child: _categories()),
      SliverToBoxAdapter(child: _destinationsCarousel()),
      SliverToBoxAdapter(child: SectionHeader(title: 'Recent Flights', seeAllRoute: AppRoutes.flights)),
      _flightSliver(),
      const SliverToBoxAdapter(child: SizedBox(height: 24)),
    ],
  );

  Widget _hotelsTab() => CustomScrollView(
    physics: const BouncingScrollPhysics(),
    slivers: [
      SliverToBoxAdapter(child: _hero()),
      SliverToBoxAdapter(child: _searchBar()),
      SliverToBoxAdapter(child: _categories()),
      SliverToBoxAdapter(child: SectionHeader(title: 'Featured Hotels', seeAllRoute: AppRoutes.hotels)),
      _hotelSliver(),
      const SliverToBoxAdapter(child: SizedBox(height: 24)),
    ],
  );

  Widget _roomsTab() => CustomScrollView(
    physics: const BouncingScrollPhysics(),
    slivers: [
      SliverToBoxAdapter(child: _hero()),
      SliverToBoxAdapter(child: _searchBar()),
      SliverToBoxAdapter(child: _categories()),
      SliverToBoxAdapter(child: SectionHeader(title: 'Available Rooms', seeAllRoute: AppRoutes.rooms)),
      _roomSliver(),
      const SliverToBoxAdapter(child: SizedBox(height: 24)),
    ],
  );

  Widget _bookingsTab() => CustomScrollView(
    physics: const BouncingScrollPhysics(),
    slivers: [
      SliverToBoxAdapter(child: _hero()),
      SliverToBoxAdapter(child: SectionHeader(title: 'Your Bookings', seeAllRoute: AppRoutes.bookingHistory)),
      SliverToBoxAdapter(child: _bookingsFetchTrigger()),
      _bookingSliver(),
      const SliverToBoxAdapter(child: SizedBox(height: 24)),
    ],
  );

  Widget _bookingsFetchTrigger() {
    return Obx(() {
      final uid = _auth.user.value?.id;
      if (uid != null && _bookings.bookings.isEmpty && !_bookings.isLoading.value) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _bookings.fetchUserBookings();
        });
      }
      return const SizedBox.shrink();
    });
  }

  Widget _destinationsCarousel() {
    const dests = [
      {'name': 'New York', 'price': '299'},
      {'name': 'Dubai', 'price': '399'},
      {'name': 'Paris', 'price': '449'},
      {'name': 'Tokyo', 'price': '599'},
    ];
    return SizedBox(
      height: 150,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: dests.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (_, i) => GestureDetector(
          onTap: () => _navigateTo(AppRoutes.flights, arguments: {'search': dests[i]['name']}),
          child: Container(
            width: 130,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [AppTheme.gold.withOpacity(0.15), AppTheme.gold.withOpacity(0.35)],
              ),
              border: Border.all(color: AppTheme.gold.withOpacity(0.3)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    dests[i]['name']!,
                    style: const TextStyle(color: AppTheme.cream, fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    'From \$${dests[i]['price']}',
                    style: const TextStyle(color: AppTheme.goldLt, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _flightSliver() => Obx(() {
    if (_flights.isLoading.value) {
      return SliverList(
        delegate: SliverChildBuilderDelegate(
              (_, _) => _skeleton(height: 130),
          childCount: 3,
        ),
      );
    }
    if (_flights.flights.isEmpty) {
      return SliverToBoxAdapter(child: _empty('No flights available'));
    }
    final list = _flights.flights.take(5).toList();
    return SliverList(
      delegate: SliverChildBuilderDelegate(
            (_, i) => _flightCard(list[i]),
        childCount: list.length,
      ),
    );
  });

  Widget _hotelSliver() => Obx(() {
    if (_hotels.isLoading.value) {
      return SliverList(
        delegate: SliverChildBuilderDelegate(
              (_, _) => _skeleton(height: 110),
          childCount: 3,
        ),
      );
    }
    if (_hotels.hotels.isEmpty) {
      return SliverToBoxAdapter(child: _empty('No hotels available'));
    }
    final list = _hotels.hotels.take(5).toList();
    return SliverList(
      delegate: SliverChildBuilderDelegate(
            (_, i) => _hotelCard(list[i]),
        childCount: list.length,
      ),
    );
  });

  Widget _roomSliver() => Obx(() {
    if (_rooms.isLoading.value) {
      return SliverList(
        delegate: SliverChildBuilderDelegate(
              (_, _) => _skeleton(height: 110),
          childCount: 3,
        ),
      );
    }
    if (_rooms.rooms.isEmpty) {
      return SliverToBoxAdapter(child: _empty('No rooms available'));
    }
    final list = _rooms.rooms.take(5).toList();
    return SliverList(
      delegate: SliverChildBuilderDelegate(
            (_, i) => _roomCard(list[i]),
        childCount: list.length,
      ),
    );
  });

  Widget _bookingSliver() => Obx(() {
    if (_bookings.isLoading.value) {
      return SliverList(
        delegate: SliverChildBuilderDelegate(
              (_, _) => _skeleton(height: 90),
          childCount: 3,
        ),
      );
    }
    if (_bookings.bookings.isEmpty) {
      return SliverToBoxAdapter(child: _empty('No bookings yet'));
    }
    return SliverList(
      delegate: SliverChildBuilderDelegate(
            (_, i) => _bookingCard(_bookings.bookings[i]),
        childCount: _bookings.bookings.length,
      ),
    );
  });

  Widget _flightCard(Flight f) {
    final dur = f.arrivalTime.difference(f.departureTime);
    final seatsLow = f.availableSeats < 10;

    String fmt(DateTime t) {
      final h = t.hour;
      final m = t.minute.toString().padLeft(2, '0');
      final pm = h >= 12 ? 'PM' : 'AM';
      final dh = h > 12 ? h - 12 : (h == 0 ? 12 : h);
      return '$dh:$m $pm';
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
                ),
                child: const Icon(Icons.flight_rounded, color: AppTheme.gold, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${f.departureCity} → ${f.arrivalCity}',
                      style: const TextStyle(color: AppTheme.cream, fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                    Text(
                      '${f.airline} · ${f.flightNumber}',
                      style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${f.price.toStringAsFixed(0)}',
                    style: const TextStyle(color: AppTheme.goldLt, fontSize: 20, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    '${f.availableSeats} seats',
                    style: TextStyle(
                      color: seatsLow ? AppTheme.warning : AppTheme.success,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                fmt(f.departureTime),
                style: const TextStyle(color: AppTheme.cream, fontSize: 14, fontWeight: FontWeight.w600),
              ),
              Text(
                '${dur.inHours}h ${dur.inMinutes.remainder(60)}m',
                style: const TextStyle(color: AppTheme.muted, fontSize: 12),
              ),
              Text(
                fmt(f.arrivalTime),
                style: const TextStyle(color: AppTheme.cream, fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    _navigateTo(AppRoutes.flightsDetails, arguments: {
                      'id': f.id,
                      'airline': f.airline,
                      'flightNumber': f.flightNumber,
                      'departureCity': f.departureCity,
                      'arrivalCity': f.arrivalCity,
                      'departureTime': f.departureTime.toIso8601String(),
                      'arrivalTime': f.arrivalTime.toIso8601String(),
                      'price': f.price,
                      'availableSeats': f.availableSeats,
                    });
                  },
                  style: AppTheme.secondaryButton.copyWith(
                    shape: WidgetStatePropertyAll(
                      RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  child: const Text('Details'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _navigateTo(AppRoutes.booking, arguments: {
                    'type': 'flight',
                    'referenceId': f.id,
                    'price': f.price,
                    'quantity': 1,
                    'totalPrice': f.price,
                    'flightDetails': {
                      'airline': f.airline,
                      'flightNumber': f.flightNumber,
                      'from': f.departureCity,
                      'to': f.arrivalCity,
                      'departureTime': f.departureTime.toIso8601String(),
                      'arrivalTime': f.arrivalTime.toIso8601String(),
                      'departureCity': f.departureCity,
                      'arrivalCity': f.arrivalCity,
                    },
                  }),
                  style: AppTheme.primaryButton.copyWith(
                    shape: WidgetStatePropertyAll(
                      RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  child: const Text('Book', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _hotelCard(Hotel h) {
    final imageUrl = h.images.isNotEmpty ? h.images.first.url : null;
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.gold.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
              image: imageUrl != null
                  ? DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover)
                  : null,
            ),
            child: imageUrl == null
                ? const Icon(Icons.hotel_rounded, color: AppTheme.gold, size: 32)
                : null,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  h.name,
                  style: const TextStyle(color: AppTheme.cream, fontSize: 15, fontWeight: FontWeight.w700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, color: AppTheme.muted, size: 12),
                    const SizedBox(width: 3),
                    Expanded(
                      child: Text(
                        h.city,
                        style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, color: AppTheme.gold, size: 14),
                    const SizedBox(width: 3),
                    Text(
                      h.rating.toStringAsFixed(1),
                      style: const TextStyle(color: AppTheme.cream, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${h.roomsAvailable} rooms',
                      style: const TextStyle(color: AppTheme.success, fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$${h.price.toStringAsFixed(0)}/night',
                      style: const TextStyle(color: AppTheme.goldLt, fontSize: 14, fontWeight: FontWeight.w800),
                    ),
                    SizedBox(
                      width: 70,
                      child: ElevatedButton(
                        onPressed: () => _navigateTo(
                          AppRoutes.hotelsDetails,
                          arguments: {'hotelId': h.id},
                        ),
                        style: AppTheme.primaryButton.copyWith(
                          padding: const WidgetStatePropertyAll(EdgeInsets.zero),
                          shape: WidgetStatePropertyAll(
                            RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          minimumSize: const WidgetStatePropertyAll(Size(70, 32)),
                        ),
                        child: const Text('View', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _roomCard(dynamic room) => GestureDetector(
    onTap: () => _navigateTo(
      AppRoutes.roomsDetails,
      arguments: {'roomId': room.id},
    ),
    child: Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.gold.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
            ),
            child: const Icon(Icons.king_bed_rounded, color: AppTheme.gold, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  room.roomType ?? 'Room',
                  style: const TextStyle(color: AppTheme.cream, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                Text(
                  '\$${room.price?.toStringAsFixed(0) ?? '—'}/night',
                  style: const TextStyle(color: AppTheme.goldLt, fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: ((room.availableRooms ?? 0) > 0 ? AppTheme.success : AppTheme.error).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: ((room.availableRooms ?? 0) > 0 ? AppTheme.success : AppTheme.error).withOpacity(0.3),
                  ),
                ),
                child: Text(
                  (room.availableRooms ?? 0) > 0 ? 'Available' : 'Full',
                  style: TextStyle(
                    color: (room.availableRooms ?? 0) > 0 ? AppTheme.success : AppTheme.error,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 60,
                child: ElevatedButton(
                  onPressed: () => _navigateTo(
                    AppRoutes.roomsDetails,
                    arguments: {'roomId': room.id},
                  ),
                  style: AppTheme.primaryButton.copyWith(
                    padding: const WidgetStatePropertyAll(EdgeInsets.zero),
                    shape: WidgetStatePropertyAll(
                      RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    minimumSize: const WidgetStatePropertyAll(Size(60, 28)),
                  ),
                  child: const Text('View', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );

  Widget _bookingCard(Booking b) {
    final isFlight = b.type == 'flight';
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isFlight ? AppTheme.gold : AppTheme.success).withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: (isFlight ? AppTheme.gold : AppTheme.success).withOpacity(0.2),
              ),
            ),
            child: Icon(
              isFlight ? Icons.flight_takeoff_rounded : Icons.hotel_rounded,
              color: isFlight ? AppTheme.gold : AppTheme.success,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isFlight ? 'Flight Booking' : 'Hotel Booking',
                  style: const TextStyle(color: AppTheme.cream, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                Text(
                  'Qty: ${b.quantity} · \$${b.totalPrice.toStringAsFixed(0)}',
                  style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StatusBadge(status: b.status),
              TextButton(
                onPressed: () {
                  Get.to(
                        () => const BookingDetailsView(),
                    arguments: {"booking": b},
                  );
                },
                style: TextButton.styleFrom(
                  foregroundColor: AppTheme.gold,
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(40, 28),
                ),
                child: const Text('View', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}