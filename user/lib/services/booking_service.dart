import 'package:get/get.dart';
import '../core/api_client.dart';
import '../models/booking_model.dart';

class BookingService extends GetxService {
  final ApiClient apiClient = Get.find<ApiClient>();

  Future<Booking> createBooking({
    required String type,
    required String referenceId,
    int quantity = 1,
    required double totalPrice,
  }) async {
    try {
      final response = await apiClient.post("/bookings", {
        "type": type,
        "referenceId": referenceId,
        "quantity": quantity,
        "totalPrice": totalPrice,
      });

      return Booking.fromJson(response.data["booking"]);
    } catch (e) {
      throw Exception("Failed to create booking");
    }
  }

  Future<List<Booking>> getUserBookings() async {
    try {
      final response = await apiClient.get("/bookings");

      final raw = response.data["bookings"];
      if (raw is! List) return [];

      return raw.map((b) => Booking.fromJson(b)).toList();
    } catch (e) {
      throw Exception("Failed to fetch bookings");
    }
  }

  Future<Booking> getBookingById(String bookingId) async {
    try {
      final response = await apiClient.get("/bookings/$bookingId");
      return Booking.fromJson(response.data["booking"]);
    } catch (e) {
      throw Exception("Failed to fetch booking");
    }
  }
}