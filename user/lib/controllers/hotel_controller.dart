import 'package:get/get.dart';
import '../models/hotel_model.dart';
import '../models/room_model.dart';
import '../services/hotel_service.dart';
import '../services/room_service.dart';

class HotelController extends GetxController {
  final HotelService hotelService = Get.find<HotelService>();
  final RoomService roomService = Get.find<RoomService>();

  var hotels = <Hotel>[].obs;
  var selectedHotel = Rxn<Hotel>();
  var hotelRooms = <Room>[].obs;

  var isLoading = false.obs;
  var isLoadingRooms = false.obs;

  @override
  void onReady() {
    fetchHotels();
    super.onReady();
  }

  Future<void> fetchHotels({
    String? search,
    String? city,
    double? minRating,
    double? maxRating,
    double? minPrice,
    double? maxPrice,
    int? minRooms,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      isLoading.value = true;

      hotels.clear();

      final result = await hotelService.getHotels(
        search: search,
        city: city,
        minRating: minRating,
        maxRating: maxRating,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minRooms: minRooms,
        sortBy: sortBy,
        sortOrder: sortOrder,
      );

      hotels.assignAll(result);

    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }


  Future<void> fetchHotelById(String id) async {
    try {
      isLoading.value = true;

      final hotel = await hotelService.getHotelById(id);
      selectedHotel.value = hotel;

      await fetchRoomsForHotel(id);

    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }


  Future<void> fetchRoomsForHotel(String hotelId) async {
    try {
      isLoadingRooms.value = true;

      hotelRooms.clear();
      final rooms = await roomService.getRooms(hotelId: hotelId);

      hotelRooms.assignAll(rooms);

    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoadingRooms.value = false;
    }
  }


  Future<void> searchHotels({
    String? name,
    String? city,
    double? minRating,
    double? maxRating,
  }) async {
    try {
      isLoading.value = true;

      final result = await hotelService.searchHotels(
        name: name,
        city: city,
        minRating: minRating,
        maxRating: maxRating,
      );

      if (result.isEmpty) {
        await fetchHotels();
        Get.snackbar("No Results", "Showing all hotels instead");
      } else {
        hotels.assignAll(result);
      }

    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshHotels() async {
    await fetchHotels();
  }
}