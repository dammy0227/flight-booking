import 'package:get/get.dart';
import '../models/booking_model.dart';
import '../services/booking_service.dart';

class BookingController extends GetxController {
  final BookingService bookingService = Get.find<BookingService>();

  var bookings = <Booking>[].obs;
  var selectedBooking = Rxn<Booking>();
  var isLoading = false.obs;

  Future<void> fetchUserBookings() async {
    try {
      isLoading.value = true;
      bookings.value = await bookingService.getUserBookings();
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshBookings() async {
    try {
      isLoading.value = true;
      bookings.value = await bookingService.getUserBookings();
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchBookingById(String bookingId) async {
    try {
      isLoading.value = true;
      selectedBooking.value = await bookingService.getBookingById(bookingId);
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createNewBooking({
    required String type,
    required String referenceId,
    int quantity = 1,
    required double totalPrice,
  }) async {
    try {
      isLoading.value = true;

      final booking = await bookingService.createBooking(
        type: type,
        referenceId: referenceId,
        quantity: quantity,
        totalPrice: totalPrice,
      );

      bookings.add(booking);
      selectedBooking.value = booking;

      Get.snackbar("Success", "Booking created successfully");
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }
}