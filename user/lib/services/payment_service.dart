import 'package:get/get.dart';
import '../core/api_client.dart';
import '../models/payment_model.dart';

class PaymentService extends GetxService {
  final ApiClient apiClient = Get.find<ApiClient>();

  Future<Payment> createPayment({
    required String bookingId,
    required String paymentMethod,
    required String token,
  }) async {
    try {
      final response = await apiClient.post("/payments", {
        "bookingId": bookingId,
        "paymentMethod": paymentMethod,
        "token": token,
      });

      return Payment.fromJson(response.data["payment"]);
    } catch (e) {
      throw Exception("Payment failed");
    }
  }


  Future<Payment> getPaymentById(String paymentId) async {
    try {
      final response = await apiClient.get("/payments/$paymentId");
      return Payment.fromJson(response.data["payment"]);
    } catch (e) {
      throw Exception("Failed to fetch payment");
    }
  }
}