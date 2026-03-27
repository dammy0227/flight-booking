import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/booking_controller.dart';
import '../../controllers/flight_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../core/widgets/info_row.dart';
import '../../models/flight_model.dart';

class FlightDetailsView extends StatefulWidget {
  const FlightDetailsView({super.key});

  @override
  State<FlightDetailsView> createState() => _FlightDetailsViewState();
}

class _FlightDetailsViewState extends State<FlightDetailsView> {
  late Flight flight;
  final FlightController controller = Get.find<FlightController>();
  final BookingController bookingController = Get.find<BookingController>();

  int numberOfPassengers = 1;
  bool isLoading = false;

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
        title: Text(
          '${flight.airline} - ${flight.flightNumber}',
          style: const TextStyle(color: AppTheme.cream),
        ),
        centerTitle: true,
        leading: const CustomBackButton(),
      ),
      body: isLoading
          ? const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
        ),
      )
          : AnimatedPage(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildFlightInfoCard(),
              const SizedBox(height: 16),
              _buildPassengerSelector(),
              const SizedBox(height: 16),
              _buildPriceDetails(),
              const SizedBox(height: 24),
              _buildBookingButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFlightInfoCard() {
    final seatsLow = flight.availableSeats < 10;
    final duration = flight.arrivalTime.difference(flight.departureTime);

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                      child: const Icon(Icons.flight_rounded, color: AppTheme.gold, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          flight.airline,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.cream,
                          ),
                        ),
                        Text(
                          flight.flightNumber,
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
                  child: Text(
                    '${flight.availableSeats} seats left',
                    style: TextStyle(
                      color: seatsLow ? AppTheme.warning : AppTheme.success,
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _formatTime(flight.departureTime),
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.cream,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        flight.departureCity,
                        style: const TextStyle(
                          fontSize: 16,
                          color: AppTheme.muted,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Departure Airport',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.muted.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      const Icon(Icons.flight_takeoff, color: AppTheme.gold, size: 28),
                      const SizedBox(height: 8),
                      Text(
                        '${duration.inHours}h ${duration.inMinutes.remainder(60)}m',
                        style: TextStyle(color: AppTheme.muted, fontSize: 14),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        height: 1,
                        color: AppTheme.border,
                      ),
                      const Text('Direct Flight', style: TextStyle(color: AppTheme.muted, fontSize: 12)),
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
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.cream,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        flight.arrivalCity,
                        style: const TextStyle(
                          fontSize: 16,
                          color: AppTheme.muted,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Arrival Airport',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.muted.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
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
            const Text(
              'Passengers',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.cream),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Number of Passengers', style: TextStyle(color: AppTheme.muted)),
                Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.bg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.remove, color: AppTheme.gold, size: 20),
                        onPressed: numberOfPassengers > 1
                            ? () {
                          setState(() {
                            numberOfPassengers--;
                          });
                        }
                            : null,
                      ),
                    ),
                    Container(
                      width: 50,
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
                        color: AppTheme.bg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.add, color: AppTheme.gold, size: 20),
                        onPressed: numberOfPassengers < flight.availableSeats
                            ? () {
                          setState(() {
                            numberOfPassengers++;
                          });
                        }
                            : null,
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

  Widget _buildPriceDetails() {
    final totalPrice = flight.price * numberOfPassengers;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            InfoRow(
              label: "Price per passenger",
              value: "\$${flight.price.toStringAsFixed(2)}",
            ),
            const SizedBox(height: 12),
            InfoRow(
              label: "Number of passengers",
              value: "x$numberOfPassengers",
            ),
            const SizedBox(height: 16),
            Container(height: 1, color: AppTheme.border),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.cream),
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
    final isAvailable = flight.availableSeats >= numberOfPassengers;
    final buttonText = isAvailable
        ? 'Book Now - \$${(flight.price * numberOfPassengers).toStringAsFixed(2)}'
        : 'Not enough seats available';

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isAvailable ? _proceedToBooking : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.gold,
          foregroundColor: AppTheme.bg,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          disabledBackgroundColor: AppTheme.muted.withOpacity(0.3),
        ),
        child: Text(
          buttonText,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  void _proceedToBooking() async {
    setState(() {
      isLoading = true;
    });

    try {
      final totalPrice = flight.price * numberOfPassengers;

      Get.toNamed('/booking', arguments: {
        "type": "flight",
        "referenceId": flight.id,
        "price": flight.price,
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
}