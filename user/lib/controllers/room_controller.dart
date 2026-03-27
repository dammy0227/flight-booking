import 'package:get/get.dart';
import '../models/room_model.dart';
import '../services/room_service.dart';

class RoomController extends GetxController {
  final RoomService roomService = Get.find<RoomService>();

  var rooms = <Room>[].obs;
  var groupedRooms = <Map<String, dynamic>>[].obs;
  var selectedRoom = Rxn<Room>();
  var isLoading = false.obs;

  Future<void> fetchRooms({
    String? search,
    String? hotelId,
    String? availability,
    String? sort,
  }) async {
    try {
      isLoading.value = true;
      rooms.value = await roomService.getRooms(
        search: search,
        hotelId: hotelId,
        availability: availability,
        sort: sort,
      );
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchRoomById(String id) async {
    try {
      isLoading.value = true;
      final result = await roomService.getRoomById(id);
      selectedRoom.value = result;
    } catch (e) {
      selectedRoom.value = null;
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchRoomsGroupedByHotel() async {
    try {
      isLoading.value = true;
      groupedRooms.value = await roomService.getRoomsGroupedByHotel();
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }
}