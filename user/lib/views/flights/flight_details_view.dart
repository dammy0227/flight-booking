import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/booking_controller.dart';
import '../../controllers/flight_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/widgets/back_button.dart';
import '../../core/widgets/info_row.dart';
import '../../models/flight_model.dart';

class FlightDetailsView extends StatefulWidget {
  const FlightDetailsView({super.key});

  @override
  State<FlightDetailsView> createState() => _FlightDetailsViewState();
}

class _FlightDetailsViewState extends State<FlightDetailsView> with SingleTickerProviderStateMixin {
  late Flight flight;
  final FlightController controller = Get.find<FlightController>();
  final BookingController bookingController = Get.find<BookingController>();

  int numberOfPassengers = 1;
  String selectedCabin = 'economy';
  bool isLoading = false;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = Get.arguments;

    if (args is Flight) {
      flight = args;
    } else if (args is Map<String, dynamic>) {
      flight = Flight(
        id: args['id'],
        airline: args['airline'],
        flightNumber: args['flightNumber'],
        departureCity: args['departureCity'],
        arrivalCity: args['arrivalCity'],
        departureTime: DateTime.parse(args['departureTime']),
        arrivalTime: DateTime.parse(args['arrivalTime']),
        price: args['price'].toDouble(),
        availableSeats: args['availableSeats'],
      );
    } else {
      flight = Flight(
        id: '',
        airline: '',
        flightNumber: '',
        departureCity: '',
        arrivalCity: '',
        departureTime: DateTime.now(),
        arrivalTime: DateTime.now(),
        price: 0,
        availableSeats: 0,
      );
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
          'Flight Details',
          style: TextStyle(color: AppTheme.cream, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
      ),
      body: isLoading
          ? const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
        ),
      )
          : FadeTransition(
        opacity: _animationController,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeaderCard(),
              const SizedBox(height: 16),
              _buildFlightRouteCard(),
              const SizedBox(height: 16),
              _buildCabinClassSelector(),
              const SizedBox(height: 16),
              _buildFlightDetailsCard(),
              const SizedBox(height: 16),
              _buildAmenitiesCard(),
              const SizedBox(height: 16),
              _buildPassengerSelector(),
              const SizedBox(height: 16),
              _buildPriceSummary(),
              const SizedBox(height: 24),
              _buildBookingButton(),
              const SizedBox(height: 16),
              _buildInfoFooter(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard() {
    final seatsLow = flight.availableSeats < 10;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.card, AppTheme.cardDark],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        AppTheme.gold.withOpacity(0.2),
                        AppTheme.gold.withOpacity(0.1),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.gold.withOpacity(0.3)),
                  ),
                  child: const Icon(
                    Icons.flight_rounded,
                    color: AppTheme.gold,
                    size: 32,
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      flight.airline,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.cream,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Flight ${flight.flightNumber}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppTheme.muted,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: seatsLow ? AppTheme.warning.withOpacity(0.2) : AppTheme.success.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: seatsLow ? AppTheme.warning.withOpacity(0.3) : AppTheme.success.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    seatsLow ? Icons.warning_amber_rounded : Icons.check_circle_rounded,
                    color: seatsLow ? AppTheme.warning : AppTheme.success,
                    size: 14,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${flight.availableSeats} seats left',
                    style: TextStyle(
                      color: seatsLow ? AppTheme.warning : AppTheme.success,
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlightRouteCard() {
    final duration = flight.arrivalTime.difference(flight.departureTime);
    final durationHours = duration.inHours;
    final durationMinutes = duration.inMinutes.remainder(60);

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _formatTime(flight.departureTime),
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.cream,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    flight.departureCity,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.gold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatShortDate(flight.departureTime),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.muted,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          height: 2,
                          color: AppTheme.border,
                        ),
                        Container(
                          height: 2,
                          width: MediaQuery.of(context).size.width * 0.2,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [AppTheme.gold, AppTheme.gold.withOpacity(0.5)],
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.card,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.gold, width: 2),
                          ),
                          child: const Icon(
                            Icons.flight_rounded,
                            color: AppTheme.gold,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${durationHours}h ${durationMinutes}m',
                    style: const TextStyle(
                      color: AppTheme.muted,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Direct Flight',
                    style: TextStyle(
                      color: AppTheme.muted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    _formatTime(flight.arrivalTime),
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.cream,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    flight.arrivalCity,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.gold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatShortDate(flight.arrivalTime),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.muted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCabinClassSelector() {
    final cabins = [
      CabinClass(
        id: 'economy',
        name: 'Economy',
        price: flight.price,
        icon: Icons.people_rounded,
        features: ['Standard seat', 'Meal included', '1 carry-on', 'Free Wi-Fi'],
      ),
      CabinClass(
        id: 'business',
        name: 'Business',
        price: flight.price * 2.5,
        icon: Icons.business_center_rounded,
        features: ['Extra legroom', 'Premium meal', '2 carry-ons', 'Lounge access', 'Priority boarding'],
      ),
      CabinClass(
        id: 'first',
        name: 'First Class',
        price: flight.price * 4,
        icon: Icons.star_rounded,
        features: ['Lie-flat seat', 'Gourmet dining', 'Priority boarding', 'Luxury lounge', 'Chauffeur service'],
      ),
    ];

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.inventory_2_rounded, color: AppTheme.gold, size: 20),
                SizedBox(width: 8),
                Text(
                  'Cabin Class',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.cream,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...cabins.map((cabin) => _buildCabinOption(cabin)),
          ],
        ),
      ),
    );
  }

  Widget _buildCabinOption(CabinClass cabin) {
    final isSelected = selectedCabin == cabin.id;

    return GestureDetector(
      onTap: () {
        setState(() {
          selectedCabin = cabin.id;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.gold.withOpacity(0.1) : AppTheme.bg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppTheme.gold : AppTheme.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(cabin.icon, color: AppTheme.gold, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      cabin.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.cream,
                      ),
                    ),
                  ],
                ),
                Text(
                  '\$${cabin.price.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.goldLt,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: cabin.features.take(3).map((feature) {
                return Text(
                  '• $feature',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.muted,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlightDetailsCard() {
    final duration = flight.arrivalTime.difference(flight.departureTime);
    final durationHours = duration.inHours;
    final durationMinutes = duration.inMinutes.remainder(60);
    final seatsLow = flight.availableSeats < 10;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.info_outline_rounded, color: AppTheme.gold, size: 20),
                SizedBox(width: 8),
                Text(
                  'Flight Details',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.cream,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 2.5,
              children: [
                _buildDetailItem(
                  icon: Icons.access_time_rounded,
                  label: 'Duration',
                  value: '${durationHours}h ${durationMinutes}m',
                ),
                _buildDetailItem(
                  icon: Icons.location_on_rounded,
                  label: 'Route',
                  value: '${flight.departureCity} → ${flight.arrivalCity}',
                ),
                _buildDetailItem(
                  icon: Icons.people_rounded,
                  label: 'Available Seats',
                  value: '${flight.availableSeats} seats',
                  valueColor: seatsLow ? AppTheme.warning : AppTheme.success,
                ),
                _buildDetailItem(
                  icon: Icons.calendar_today_rounded,
                  label: 'Travel Date',
                  value: _formatDate(flight.departureTime),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.gold, size: 18),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.muted,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: valueColor ?? AppTheme.cream,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAmenitiesCard() {
    final amenities = [
      {'icon': Icons.wifi_rounded, 'name': 'Free Wi-Fi'},
      {'icon': Icons.tv_rounded, 'name': 'Entertainment'},
      {'icon': Icons.food_bank_rounded, 'name': 'Meals'},
      {'icon': Icons.usb_rounded, 'name': 'USB Ports'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.bolt_rounded, color: AppTheme.gold, size: 20),
                SizedBox(width: 8),
                Text(
                  'Onboard Amenities',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.cream,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 3,
              children: amenities.map((amenity) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.cardDark,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(amenity['icon'] as IconData, color: AppTheme.gold, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        amenity['name'] as String,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.cream,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPassengerSelector() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.people_rounded, color: AppTheme.gold, size: 20),
                SizedBox(width: 8),
                Text(
                  'Passengers',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.cream,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Number of Passengers',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.muted,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.cardDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.remove, color: AppTheme.gold, size: 18),
                        onPressed: numberOfPassengers > 1
                            ? () {
                          setState(() {
                            numberOfPassengers--;
                          });
                        }
                            : null,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 40,
                          minHeight: 40,
                        ),
                      ),
                    ),
                    Container(
                      width: 48,
                      alignment: Alignment.center,
                      child: Text(
                        numberOfPassengers.toString(),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.cream,
                        ),
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.cardDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.add, color: AppTheme.gold, size: 18),
                        onPressed: numberOfPassengers < flight.availableSeats
                            ? () {
                          setState(() {
                            numberOfPassengers++;
                          });
                        }
                            : null,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 40,
                          minHeight: 40,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceSummary() {
    final selectedCabinPrice = _getSelectedCabinPrice();
    final totalPrice = selectedCabinPrice * numberOfPassengers;
    final selectedCabinName = _getSelectedCabinName();

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.gold.withOpacity(0.1),
            Colors.transparent,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.credit_card_rounded, color: AppTheme.gold, size: 20),
                SizedBox(width: 8),
                Text(
                  'Price Summary',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.cream,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            InfoRow(
              label: "Price per passenger ($selectedCabinName)",
              value: "\$${selectedCabinPrice.toStringAsFixed(2)}",
            ),
            const SizedBox(height: 12),
            InfoRow(
              label: "Number of passengers",
              value: "x$numberOfPassengers",
            ),
            const SizedBox(height: 16),
            Container(height: 1, color: AppTheme.gold.withOpacity(0.2)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.cream,
                  ),
                ),
                Text(
                  '\$${totalPrice.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.goldLt,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingButton() {
    final selectedCabinPrice = _getSelectedCabinPrice();
    final totalPrice = selectedCabinPrice * numberOfPassengers;
    final isAvailable = flight.availableSeats >= numberOfPassengers;
    final buttonText = isAvailable
        ? 'Book Now - \$${totalPrice.toStringAsFixed(2)}'
        : 'Not enough seats available';

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isAvailable ? _proceedToBooking : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.gold,
          foregroundColor: AppTheme.bg,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          disabledBackgroundColor: AppTheme.border,
          elevation: 0,
        ),
        child: Text(
          buttonText,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  Widget _buildInfoFooter() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.shield_rounded, color: AppTheme.gold, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Free cancellation up to 24h',
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.muted,
                ),
              ),
            ],
          ),
          Row(
            children: [
              const Icon(Icons.trending_up_rounded, color: AppTheme.gold, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Best price guaranteed',
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.muted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  double _getSelectedCabinPrice() {
    switch (selectedCabin) {
      case 'business':
        return flight.price * 2.5;
      case 'first':
        return flight.price * 4;
      default:
        return flight.price;
    }
  }

  String _getSelectedCabinName() {
    switch (selectedCabin) {
      case 'business':
        return 'Business';
      case 'first':
        return 'First Class';
      default:
        return 'Economy';
    }
  }

  void _proceedToBooking() async {
    setState(() {
      isLoading = true;
    });

    try {
      final selectedCabinPrice = _getSelectedCabinPrice();
      final totalPrice = selectedCabinPrice * numberOfPassengers;

      Get.toNamed('/booking', arguments: {
        "type": "flight",
        "referenceId": flight.id,
        "price": selectedCabinPrice,
        "quantity": numberOfPassengers,
        "totalPrice": totalPrice,
        "flightDetails": {
          "airline": flight.airline,
          "flightNumber": flight.flightNumber,
          "from": flight.departureCity,
          "to": flight.arrivalCity,
          "departureTime": flight.departureTime.toIso8601String(),
          "arrivalTime": flight.arrivalTime.toIso8601String(),
          "departureCity": flight.departureCity,
          "arrivalCity": flight.arrivalCity,
          "cabinClass": selectedCabin,
        }
      });
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to proceed: $e',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppTheme.error,
        colorText: Colors.white,
        borderRadius: 12,
        margin: const EdgeInsets.all(16),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  String _formatTime(DateTime time) {
    final h = time.hour;
    final m = time.minute.toString().padLeft(2, '0');
    final period = h >= 12 ? 'PM' : 'AM';
    final hour12 = h > 12 ? h - 12 : (h == 0 ? 12 : h);
    return '$hour12:$m $period';
  }

  String _formatDate(DateTime date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const weekdays = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    return '${weekdays[date.weekday % 7]}, ${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  String _formatShortDate(DateTime date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}';
  }
}

class CabinClass {
  final String id;
  final String name;
  final double price;
  final IconData icon;
  final List<String> features;

  CabinClass({
    required this.id,
    required this.name,
    required this.price,
    required this.icon,
    required this.features,
  });
}