import 'package:get/get.dart';
import '../models/payment_model.dart';
import '../services/payment_service.dart';

class PaymentController extends GetxController {
  final PaymentService paymentService = Get.find<PaymentService>();

  var payments = <Payment>[].obs;
  var selectedPayment = Rxn<Payment>();
  var isLoading = false.obs;

  Future<bool> createNewPayment({
    required String bookingId,
    required String paymentMethod,
    required String token,
  }) async {
    try {
      isLoading.value = true;

      final payment = await paymentService.createPayment(
        bookingId: bookingId,
        paymentMethod: paymentMethod,
        token: token,
      );

      payments.add(payment);
      selectedPayment.value = payment;

      return true;
    } catch (e) {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchPaymentById(String paymentId) async {
    try {
      isLoading.value = true;
      selectedPayment.value = await paymentService.getPaymentById(paymentId);
    } catch (e) {
      throw Exception("Failed to fetch payment");
    } finally {
      isLoading.value = false;
    }
  }
}