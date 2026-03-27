import 'package:get/get.dart';

import '../views/splash/splash_view.dart';
import '../views/auth/register_view.dart';
import '../views/auth/login_view.dart';
import '../views/home/home_view.dart';

import '../views/flights/flights_view.dart';
import '../views/flights/flight_details_view.dart';

import '../views/hotels/hotels_view.dart';
import '../views/hotels/hotel_details_view.dart';

import '../views/rooms/rooms_view.dart';
import '../views/rooms/room_details_view.dart';

import '../views/bookings/booking_view.dart';
import '../views/bookings/booking_history_view.dart';
import '../views/bookings/booking_details_view.dart';

import '../views/profile/profile_view.dart';
import '../views/payments/payment_view.dart';

import 'app_routes.dart';

class AppPages {
  static final pages = [

    GetPage(
      name: AppRoutes.splash,
      page: () => SplashView(),
    ),

    GetPage(
      name: AppRoutes.login,
      page: () => LoginView(),
    ),

    GetPage(
      name: AppRoutes.register,
      page: () => RegisterView(),
    ),

    GetPage(
      name: AppRoutes.home,
      page: () => HomeView(),
    ),

    GetPage(
      name: AppRoutes.flights,
      page: () => FlightsView(),
    ),
    GetPage(
      name: AppRoutes.flightsDetails,
      page: () => FlightDetailsView(),
    ),

    GetPage(
      name: AppRoutes.hotels,
      page: () => HotelsView(),
    ),

    GetPage(
      name: AppRoutes.hotelsDetails,
      page: () => HotelDetailsView(),
    ),

    GetPage(
      name: AppRoutes.rooms,
      page: () => RoomsView(),
    ),

    GetPage(
      name: AppRoutes.roomsDetails,
      page: () => RoomDetailsView(),
    ),

    GetPage(
      name: AppRoutes.booking,
      page: () => BookingView(),
    ),

    GetPage(
      name: AppRoutes.bookingHistory,
      page: () => BookingHistoryView(),
    ),

    GetPage(
      name: AppRoutes.bookingDetails,
      page: () => BookingDetailsView(),
    ),

    GetPage(
      name: AppRoutes.payment,
      page: () => PaymentView(),
    ),

    GetPage(
      name: AppRoutes.profile,
      page: () => ProfileView(),
    ),
  ];
}