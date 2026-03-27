import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/booking_controller.dart';
import '../../controllers/payment_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/info_row.dart';

class BookingDetailsView extends StatefulWidget {
  const BookingDetailsView({super.key});

  @override
  State<BookingDetailsView> createState() => _BookingDetailsViewState();
}

class _BookingDetailsViewState extends State<BookingDetailsView> {
  final BookingController _bookingCtrl = Get.find<BookingController>();
  final PaymentController _paymentCtrl = Get.find<PaymentController>();

  dynamic booking;
  bool _isLoading = true;
  bool _hasPayment = false;

  @override
  void initState() {
    super.initState();
    final args = Get.arguments;

    if (args is Map<String, dynamic>) {
      booking = args['booking'];
    } else {
      booking = args;
    }

    if (booking != null) {
      _loadPaymentDetails();
    } else {
      _isLoading = false;
    }
  }

  Future<void> _loadPaymentDetails() async {
    setState(() => _isLoading = true);
    try {
      if (booking.paymentStatus == "paid") {
        await _paymentCtrl.fetchPaymentById(booking.id);

        if (_paymentCtrl.selectedPayment.value != null) {
          _hasPayment = true;
        } else {
          _hasPayment = false;
        }
      } else {
        _hasPayment = false;
      }
    } catch (e) {
      _hasPayment = false;
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Get.back();
        return false;
      },
      child: Scaffold(
        backgroundColor: AppTheme.bg,
        appBar: AppBar(
          backgroundColor: AppTheme.card,
          elevation: 0,
          title: const Text("Booking Receipt", style: TextStyle(color: AppTheme.cream)),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppTheme.cream),
            onPressed: () => Get.back(),
          ),
        ),
        body: _isLoading
            ? const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
          ),
        )
            : AnimatedPage(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildHeader(),
                const SizedBox(height: 20),
                _buildBookingInfo(),
                const SizedBox(height: 20),
                _buildPaymentInfo(),
                const SizedBox(height: 20),
                _buildReceiptCard(),
                const SizedBox(height: 24),
                _buildActionButtons(),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final isPaid = booking?.paymentStatus == "paid";

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isPaid
              ? [AppTheme.success.withOpacity(0.15), AppTheme.success.withOpacity(0.05)]
              : [AppTheme.warning.withOpacity(0.15), AppTheme.warning.withOpacity(0.05)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isPaid ? AppTheme.success.withOpacity(0.3) : AppTheme.warning.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isPaid ? AppTheme.success.withOpacity(0.2) : AppTheme.warning.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              isPaid ? Icons.check_circle : Icons.pending,
              color: isPaid ? AppTheme.success : AppTheme.warning,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isPaid ? "Payment Confirmed" : "Payment Pending",
                  style: TextStyle(
                    color: isPaid ? AppTheme.success : AppTheme.warning,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isPaid
                      ? "Your booking has been confirmed"
                      : "Complete payment to confirm your booking",
                  style: TextStyle(color: AppTheme.muted, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  booking?.type == "flight" ? Icons.flight_rounded : Icons.hotel_rounded,
                  color: AppTheme.gold,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                "Booking Information",
                style: TextStyle(
                  color: AppTheme.cream,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const Divider(color: AppTheme.border, height: 24),
          InfoRow(label: "Booking ID", value: booking?.id ?? "N/A"),
          const SizedBox(height: 12),
          InfoRow(label: "Type", value: "${booking?.type?.toUpperCase() ?? "N/A"} Booking"),
          const SizedBox(height: 12),
          InfoRow(
            label: "Booking Date",
            value: _formatDateTime(booking?.createdAt ?? DateTime.now()),
          ),
          const SizedBox(height: 12),
          InfoRow(
            label: "Status",
            value: booking?.status?.toUpperCase() ?? "N/A",
            valueColor: booking?.status == "confirmed" ? AppTheme.success : AppTheme.warning,
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentInfo() {
    final isPaid = booking?.paymentStatus == "paid";
    final payment = _paymentCtrl.selectedPayment.value;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.payment, color: AppTheme.gold, size: 20),
              ),
              const SizedBox(width: 12),
              const Text(
                "Payment Details",
                style: TextStyle(
                  color: AppTheme.cream,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const Divider(color: AppTheme.border, height: 24),
          InfoRow(
            label: "Total Amount",
            value: "\$${(booking?.totalPrice ?? 0).toStringAsFixed(2)}",
            valueColor: AppTheme.goldLt,
            valueSize: 18,
            isBold: true,
          ),
          const SizedBox(height: 12),
          InfoRow(
            label: "Quantity",
            value: "${booking?.quantity ?? 1} passenger${(booking?.quantity ?? 1) > 1 ? 's' : ''}",
          ),
          const SizedBox(height: 12),
          InfoRow(
            label: "Payment Status",
            value: booking?.paymentStatus?.toUpperCase() ?? "PENDING",
            valueColor: isPaid ? AppTheme.success : AppTheme.warning,
          ),
          if (isPaid && payment != null) ...[
            const SizedBox(height: 12),
            InfoRow(
              label: "Payment Method",
              value: payment.paymentMethod.toUpperCase(),
            ),
            if (payment.transactionId != null) ...[
              const SizedBox(height: 12),
              InfoRow(
                label: "Transaction ID",
                value: payment.transactionId!,
                valueSize: 11,
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildReceiptCard() {
    final isPaid = booking?.paymentStatus == "paid";

    if (!isPaid) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          children: [
            const Icon(Icons.receipt_long_rounded, color: AppTheme.muted, size: 48),
            const SizedBox(height: 12),
            Text(
              "Receipt will be available after payment",
              style: TextStyle(color: AppTheme.muted, fontSize: 14),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Get.toNamed('/payment', arguments: {
                  "bookingId": booking?.id,
                  "amount": booking?.totalPrice,
                });
              },
              style: AppTheme.primaryButton.copyWith(
                padding: const WidgetStatePropertyAll(EdgeInsets.symmetric(horizontal: 24, vertical: 12)),
              ),
              child: const Text('Pay Now'),
            ),
          ],
        ),
      );
    }

    final payment = _paymentCtrl.selectedPayment.value;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.gold.withOpacity(0.3)),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.gold.withOpacity(0.05), Colors.transparent],
        ),
      ),
      child: Column(
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "RECEIPT",
                style: TextStyle(
                  color: AppTheme.gold,
                  fontSize: 12,
                  letterSpacing: 2,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Icon(Icons.receipt_long_rounded, color: AppTheme.gold, size: 20),
            ],
          ),
          const Divider(color: AppTheme.border, height: 24),
          Center(
            child: Column(
              children: [
                const Text(
                  "123 RESERVE",
                  style: TextStyle(
                    color: AppTheme.gold,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatDateTime(booking?.createdAt ?? DateTime.now()),
                  style: TextStyle(color: AppTheme.muted, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _receiptItem("Booking ID", booking?.id ?? "N/A"),
          _receiptItem("Booking Type", booking?.type?.toUpperCase() ?? "N/A"),
          _receiptItem("Quantity", "${booking?.quantity ?? 1}"),
          _receiptItem("Amount", "\$${(booking?.totalPrice ?? 0).toStringAsFixed(2)}"),
          if (payment != null && payment.transactionId != null) ...[
            _receiptItem("Transaction ID", payment.transactionId!),
          ],
          const Divider(color: AppTheme.border, height: 20),
          _receiptItem(
            "Total Paid",
            "\$${(booking?.totalPrice ?? 0).toStringAsFixed(2)}",
            isBold: true,
            valueColor: AppTheme.goldLt,
          ),
          const Divider(color: AppTheme.border, height: 20),
          Center(
            child: Column(
              children: [
                Icon(Icons.check_circle, color: AppTheme.success, size: 16),
                const SizedBox(height: 4),
                Text(
                  "Payment Confirmed",
                  style: TextStyle(color: AppTheme.success, fontSize: 10),
                ),
                const SizedBox(height: 8),
                Text(
                  _formatDateTime(DateTime.now()),
                  style: TextStyle(color: AppTheme.muted, fontSize: 9),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    final isPaid = booking?.paymentStatus == "paid";

    return Column(
      children: [
        if (!isPaid)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Get.toNamed('/payment', arguments: {
                  "bookingId": booking?.id,
                  "amount": booking?.totalPrice,
                });
              },
              style: AppTheme.primaryButton,
              child: const Text(
                'Pay Now',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => Get.back(),
            style: AppTheme.secondaryButton,
            child: const Text(
              'Back to Bookings',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }

  Widget _receiptItem(String label, String value, {bool isBold = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: AppTheme.muted,
              fontSize: isBold ? 13 : 12,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? AppTheme.cream,
              fontSize: isBold ? 16 : 12,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime date) {
    return "${date.day}/${date.month}/${date.year} • ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}";
  }
}