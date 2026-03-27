import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:get/get.dart';
import '../../controllers/payment_controller.dart';
import '../../controllers/booking_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../routes/app_routes.dart';

class PaymentView extends StatefulWidget {
  const PaymentView({super.key});

  @override
  State<PaymentView> createState() => _PaymentViewState();
}

class _PaymentViewState extends State<PaymentView> {
  final PaymentController _paymentCtrl = Get.find<PaymentController>();
  final BookingController _bookingCtrl = Get.find<BookingController>();

  late final String _bookingId;
  late final double _amount;

  bool _cardComplete = false;
  final RxnBool _result = RxnBool();
  final RxString _errorMsg = ''.obs;

  @override
  void initState() {
    super.initState();

    final args = Get.arguments;

    if (args is Map<String, dynamic>) {
      _bookingId = args['bookingId']?.toString() ?? '';
      _amount = (args['amount'] as num?)?.toDouble() ?? 0.0;
    } else {
      _bookingId = '';
      _amount = 0.0;
    }

    if (_bookingId.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Get.snackbar(
          "Error",
          "No booking information found.",
          snackPosition: SnackPosition.TOP,
          backgroundColor: AppTheme.error,
          colorText: Colors.white,
        );
      });
    }
  }

  Future<void> _submit() async {
    if (!_cardComplete) {
      _errorMsg.value = 'Please complete your card details.';
      return;
    }
    _errorMsg.value = '';

    try {
      _paymentCtrl.isLoading.value = true;

      final paymentMethod = await Stripe.instance.createPaymentMethod(
        params: const PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      final _ = await _paymentCtrl.createNewPayment(
        bookingId: _bookingId,
        paymentMethod: 'stripe',
        token: paymentMethod.id,
      );

      await _bookingCtrl.refreshBookings();
      _result.value = true;
        } on StripeException catch (e) {
      _errorMsg.value = e.error.localizedMessage ??
          e.error.message ??
          'Payment failed. Please check your card details.';
      _result.value = false;
    } catch (e) {
      _errorMsg.value = 'Something went wrong. Please try again.';
      _result.value = false;
    } finally {
      _paymentCtrl.isLoading.value = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        backgroundColor: AppTheme.card,
        elevation: 0,
        leading: Obx(() => _result.value == true
            ? const SizedBox.shrink()
            : IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.gold),
          onPressed: () => Get.back(),
        )),
        title: Obx(() => Text(
          _result.value == true ? 'Payment Complete' : 'Secure Payment',
          style: const TextStyle(color: AppTheme.cream, fontSize: 20, fontWeight: FontWeight.w700),
        )),
      ),
      body: AnimatedPage(
        child: Obx(() {
          if (_result.value == true) return _buildSuccess();
          if (_result.value == false) return _buildFailed();
          return _buildForm();
        }),
      ),
    );
  }

  Widget _buildSuccess() {
    final payment = _paymentCtrl.selectedPayment.value;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 40, 24, 40),
      child: Column(
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.success.withOpacity(0.1),
              border: Border.all(color: AppTheme.success.withOpacity(0.4), width: 2.5),
            ),
            child: const Icon(Icons.check_rounded, color: AppTheme.success, size: 58),
          ),
          const SizedBox(height: 24),
          const Text(
            'Payment Successful!',
            style: TextStyle(color: AppTheme.cream, fontSize: 26, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            '\$${_amount.toStringAsFixed(2)}',
            style: const TextStyle(color: AppTheme.goldLt, fontSize: 38, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 32),
          if (payment != null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  const Row(
                    children: [
                      Icon(Icons.receipt_long_rounded, color: AppTheme.gold, size: 20),
                      SizedBox(width: 10),
                      Text('Payment Receipt',
                          style: TextStyle(color: AppTheme.cream, fontSize: 15, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const Divider(color: AppTheme.border, height: 24),
                  _receiptRow('Booking', '#${_bookingId.substring(_bookingId.length > 8 ? _bookingId.length - 8 : 0)}'),
                  _receiptRow('Method', 'Stripe'),
                  _receiptRow('Amount', '\$${payment.amount.toStringAsFixed(2)}'),
                  _receiptRow('Status', payment.status.toUpperCase()),
                  if (payment.transactionId != null)
                    _receiptRow('Transaction', payment.transactionId!.length > 20
                        ? '${payment.transactionId!.substring(0, 20)}...'
                        : payment.transactionId!),
                ],
              ),
            ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Get.offAllNamed(AppRoutes.home),
              style: AppTheme.primaryButton,
              child: const Text('Back to Home', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Get.offAllNamed(AppRoutes.bookingHistory),
              style: AppTheme.secondaryButton,
              child: const Text('View My Bookings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFailed() => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.error.withOpacity(0.1),
              border: Border.all(color: AppTheme.error.withOpacity(0.4), width: 2),
            ),
            child: const Icon(Icons.close_rounded, color: AppTheme.error, size: 50),
          ),
          const SizedBox(height: 24),
          const Text('Payment Failed',
              style: TextStyle(color: AppTheme.cream, fontSize: 24, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Obx(() => Text(
            _errorMsg.value.isNotEmpty
                ? _errorMsg.value
                : 'Your card was not charged.\nPlease check your details and try again.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppTheme.muted, fontSize: 14),
          )),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                _result.value = null;
                _errorMsg.value = '';
                _cardComplete = false;
              },
              style: AppTheme.primaryButton,
              child: const Text('Try Again', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.muted)),
          ),
        ],
      ),
    ),
  );

  Widget _buildForm() {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.gold.withOpacity(0.07),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Amount due', style: TextStyle(color: AppTheme.muted, fontSize: 14)),
                      const SizedBox(height: 4),
                      Text('\$${_amount.toStringAsFixed(2)}',
                          style: const TextStyle(color: AppTheme.gold, fontSize: 32, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.gold.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text('Stripe', style: TextStyle(color: AppTheme.gold, fontSize: 12)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Card Details',
                      style: TextStyle(color: AppTheme.cream, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.bg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _cardComplete ? AppTheme.gold : AppTheme.border),
                    ),
                    child: CardField(
                      onCardChanged: (details) {
                        setState(() {
                          _cardComplete = details?.complete ?? false;
                        });
                      },
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                      style: const TextStyle(color: AppTheme.cream, fontSize: 16),
                      cursorColor: AppTheme.gold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Obx(() => _errorMsg.value.isNotEmpty
                ? Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AppTheme.error, size: 18),
                  const SizedBox(width: 8),
                  Expanded(child: Text(_errorMsg.value, style: const TextStyle(color: AppTheme.error))),
                ],
              ),
            )
                : const SizedBox.shrink()),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.gold.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Text('Test Cards', style: TextStyle(color: AppTheme.gold, fontSize: 12)),
                  const SizedBox(height: 8),
                  _testCardRow('✅ Visa Success', '4242 4242 4242 4242'),
                  _testCardRow('❌ Decline', '4000 0000 0000 0002'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Obx(() => SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (_cardComplete && !_paymentCtrl.isLoading.value) ? _submit : null,
                style: AppTheme.primaryButton,
                child: _paymentCtrl.isLoading.value
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text('Pay \$${_amount.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _testCardRow(String label, String number) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 2),
    child: Row(
      children: [
        SizedBox(width: 90, child: Text(label, style: TextStyle(color: AppTheme.muted, fontSize: 10))),
        Expanded(child: Text(number, style: TextStyle(color: AppTheme.goldLt, fontSize: 10, fontFamily: 'monospace'))),
      ],
    ),
  );

  Widget _receiptRow(String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
        Flexible(
          child: Text(value,
              textAlign: TextAlign.end,
              style: const TextStyle(color: AppTheme.cream, fontSize: 12, fontWeight: FontWeight.w500)),
        ),
      ],
    ),
  );
}