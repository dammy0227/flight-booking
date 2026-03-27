import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../controllers/booking_controller.dart';
import '../controllers/flight_controller.dart';
import '../controllers/hotel_controller.dart';
import '../controllers/payment_controller.dart';
import '../controllers/room_controller.dart';
import '../controllers/user_controller.dart';


import '../services/auth_service.dart';
import '../services/user_service.dart';
import '../services/flight_service.dart';
import '../services/hotel_service.dart';
import '../services/room_service.dart';
import '../services/booking_service.dart';
import '../services/payment_service.dart';

import '../core/api_client.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {

    Get.lazyPut<ApiClient>(() => ApiClient());

    /// 🔹 Services
    Get.lazyPut<AuthService>(() => AuthService());
    Get.lazyPut<UserService>(() => UserService());
    Get.lazyPut<FlightService>(() => FlightService());
    Get.lazyPut<HotelService>(() => HotelService());
    Get.lazyPut<RoomService>(() => RoomService());
    Get.lazyPut<BookingService>(() => BookingService());
    Get.lazyPut<PaymentService>(() => PaymentService());

    /// 🔹 Controllers
    Get.put<AuthController>(AuthController(), permanent: true);
    Get.put<UserController>(UserController(), permanent: true);
    Get.put<FlightController>(FlightController(), permanent: true);
    Get.put<HotelController>(HotelController(), permanent: true);
    Get.put<RoomController>(RoomController(), permanent: true);
    Get.put<BookingController>(BookingController(), permanent: true);
    Get.put<PaymentController>(PaymentController(), permanent: true);
  }
}