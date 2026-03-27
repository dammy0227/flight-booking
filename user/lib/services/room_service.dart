import 'package:get/get.dart';
import '../core/api_client.dart';
import '../models/room_model.dart';

class RoomService extends GetxService {
  final ApiClient apiClient = Get.find<ApiClient>();

  Future<List<Room>> getRooms({
    String? search,
    String? hotelId,
    String? availability,
    String? sort,
  }) async {
    try {
      final query = <String, dynamic>{};
      if (search != null) query["search"] = search;
      if (hotelId != null) query["hotel"] = hotelId;
      if (availability != null) query["availability"] = availability;
      if (sort != null) query["sort"] = sort;

      final response = await apiClient.get("/rooms?${Uri(queryParameters: query).query}");

      final raw = response.data["rooms"];
      if (raw is! List) return [];

      return raw.map((r) => Room.fromJson(r)).toList();
    } catch (e) {
      throw Exception("Failed to fetch rooms");
    }
  }

  Future<Room> getRoomById(String id) async {
    try {
      final response = await apiClient.get("/rooms/$id");

      final data = response.data;

      if (data == null || data["room"] == null) {
        throw Exception("Invalid room response");
      }

      return Room.fromJson(data["room"]);
    } catch (e) {
      throw Exception("Failed to fetch room");
    }
  }

  Future<List<Map<String, dynamic>>> getRoomsGroupedByHotel() async {
    try {
      final response = await apiClient.get("/rooms/grouped");
      return List<Map<String, dynamic>>.from(response.data["groupedRooms"]);
    } catch (e) {
      throw Exception("Failed to fetch grouped rooms");
    }
  }
}