import 'package:get/get.dart';
import '../core/api_client.dart';
import '../models/hotel_model.dart';

class HotelService extends GetxService {
  final ApiClient apiClient = Get.find<ApiClient>();

  Future<List<Hotel>> getHotels({
    String? search,
    String? city,
    double? minRating,
    double? maxRating,
    double? minPrice,
    double? maxPrice,
    int? minRooms,
    String? sortBy,
    String? sortOrder,
    String? dateFilter,
    String? groupBy,
  }) async {
    try {
      final params = <String, dynamic>{};

      if (search?.isNotEmpty == true) params['search'] = search;
      if (city?.isNotEmpty == true) params['city'] = city;

      if (minRating != null) params['minRating'] = minRating;
      if (maxRating != null) params['maxRating'] = maxRating;

      if (minPrice != null) params['minPrice'] = minPrice;
      if (maxPrice != null) params['maxPrice'] = maxPrice;

      if (minRooms != null) params['minRooms'] = minRooms;

      if (sortBy?.isNotEmpty == true) params['sortBy'] = sortBy;
      if (sortOrder?.isNotEmpty == true) params['sortOrder'] = sortOrder;

      if (dateFilter?.isNotEmpty == true) params['dateFilter'] = dateFilter;
      if (groupBy?.isNotEmpty == true) params['groupBy'] = groupBy;

      final res = await apiClient.dioClient.get(
        '/hotels/query',
        queryParameters: params,
      );

      final data = res.data;

      final raw = (data is Map<String, dynamic>)
          ? data['hotels']
          : data;

      if (raw is! List) return [];

      return raw
          .map((e) => Hotel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch hotels: $e');
    }
  }

  Future<List<Hotel>> getAllHotels() async {
    try {
      final res = await apiClient.dioClient.get('/hotels');

      final data = res.data;
      final raw = (data is Map<String, dynamic>)
          ? data['hotels']
          : data;

      if (raw is! List) return [];

      return raw
          .map((e) => Hotel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch all hotels: $e');
    }
  }

  Future<Hotel> getHotelById(String id) async {
    try {
      final res = await apiClient.dioClient.get('/hotels/$id');

      final data = res.data;

      final json = (data is Map<String, dynamic>)
          ? (data['hotel'] ?? data)
          : null;

      if (json is! Map<String, dynamic>) {
        throw Exception('Invalid hotel response');
      }

      return Hotel.fromJson(json);
    } catch (e) {
      throw Exception('Failed to fetch hotel: $e');
    }
  }


  Future<List<Hotel>> searchHotels({
    String? name,
    String? city,
    double? minRating,
    double? maxRating,
  }) async {
    try {
      final params = <String, dynamic>{};

      if (name?.isNotEmpty == true) params['name'] = name;
      if (city?.isNotEmpty == true) params['city'] = city;

      if (minRating != null) params['minRating'] = minRating;
      if (maxRating != null) params['maxRating'] = maxRating;

      final res = await apiClient.dioClient.get(
        '/hotels/search',
        queryParameters: params,
      );

      final data = res.data;

      final raw = (data is Map<String, dynamic>)
          ? data['hotels']
          : data;

      if (raw is! List) return [];

      return raw
          .map((e) => Hotel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Search failed: $e');
    }
  }


  Future<Map<String, dynamic>> getHotelStats() async {
    try {
      final res = await apiClient.dioClient.get('/hotels/stats');

      final data = res.data;

      if (data is Map<String, dynamic>) {
        return data['stats'] ?? {};
      }

      return {};
    } catch (e) {
      throw Exception('Failed to fetch stats: $e');
    }
  }
}