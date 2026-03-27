import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/booking_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/info_row.dart';
import '../../core/widgets/status_badge.dart';
import '../../routes/app_routes.dart';
import 'booking_details_view.dart';

class BookingHistoryView extends StatefulWidget {
  const BookingHistoryView({super.key});

  @override
  State<BookingHistoryView> createState() => _BookingHistoryViewState();
}

class _BookingHistoryViewState extends State<BookingHistoryView> {
  final BookingController controller = Get.find<BookingController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.refreshBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        backgroundColor: AppTheme.card,
        elevation: 0,
        title: const Text("My Bookings", style: TextStyle(color: AppTheme.cream)),
        centerTitle: true,
        leading: const CustomBackButton(),
      ),
      body: RefreshIndicator(
        onRefresh: () => controller.refreshBookings(),
        color: AppTheme.gold,
        child: Obx(() {
          if (controller.isLoading.value && controller.bookings.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
              ),
            );
          }

          if (controller.bookings.isEmpty) {
            return EmptyState(
              title: 'No bookings yet',
              subtitle: 'Your booked flights and hotels will appear here',
              icon: Icons.airplane_ticket,
              buttonText: 'Browse Flights',
              onButtonPressed: () => Get.offAllNamed(AppRoutes.home),
            );
          }

          return AnimatedPage(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: controller.bookings.length,
              itemBuilder: (context, index) {
                final booking = controller.bookings[index];
                return _buildBookingCard(booking);
              },
            ),
          );
        }),
      ),
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    final isPaid = booking.paymentStatus == "paid";

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.gold.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
                  ),
                  child: Icon(
                    booking.type == "flight"
                        ? Icons.flight_rounded
                        : Icons.hotel_rounded,
                    color: AppTheme.gold,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "${booking.type.toUpperCase()} Booking",
                        style: const TextStyle(
                          color: AppTheme.cream,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        "ID: ${booking.id.substring(0, 8)}...",
                        style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                StatusBadge(
                  status: isPaid ? "PAID" : "PENDING",
                  isPaid: isPaid,
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.bg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  InfoRow(
                    label: "Total Amount",
                    value: "\$${booking.totalPrice.toStringAsFixed(2)}",
                    valueColor: AppTheme.goldLt,
                    valueSize: 16,
                    isBold: true,
                  ),
                  const SizedBox(height: 8),
                  InfoRow(
                    label: "Quantity",
                    value: "${booking.quantity} passenger${booking.quantity > 1 ? 's' : ''}",
                  ),
                  const SizedBox(height: 8),
                  InfoRow(
                    label: "Booking Date",
                    value: _formatDate(booking.createdAt),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      Get.to(
                            () => const BookingDetailsView(),
                        arguments: {"booking": booking},
                      );
                    },
                    style: AppTheme.secondaryButton.copyWith(
                      shape: WidgetStatePropertyAll(
                        RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    child: const Text('View Details'),
                  ),
                ),
                if (!isPaid) ...[
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Get.toNamed('/payment', arguments: {
                          "bookingId": booking.id,
                          "amount": booking.totalPrice,
                        });
                      },
                      style: AppTheme.primaryButton.copyWith(
                        shape: WidgetStatePropertyAll(
                          RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      child: const Text('Pay Now', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return "${date.day}/${date.month}/${date.year}";
  }
}