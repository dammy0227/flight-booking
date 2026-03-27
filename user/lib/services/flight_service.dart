import 'package:get/get.dart';
import '../core/api_client.dart';
import '../models/flight_model.dart';

class FlightService extends GetxService {
  final ApiClient apiClient = Get.find<ApiClient>();

  Future<List<Flight>> getFlights({
    String? from,
    String? to,
    String? search,
    String? dateFilter,
    double? minPrice,
    double? maxPrice,
    int? minSeats,
    String? sortBy,
    String? sortOrder,
  }) async {
    final params = <String, dynamic>{};
    if (from?.isNotEmpty == true) params['from'] = from;
    if (to?.isNotEmpty == true) params['to'] = to;
    if (search?.isNotEmpty == true) params['search'] = search;
    if (dateFilter?.isNotEmpty == true) params['dateFilter'] = dateFilter;
    if (minPrice != null && minPrice > 0) params['minPrice'] = minPrice;
    if (maxPrice != null && maxPrice < 9999) params['maxPrice'] = maxPrice;
    if (minSeats != null && minSeats > 1) params['minSeats'] = minSeats;
    if (sortBy?.isNotEmpty == true) params['sortBy'] = sortBy;
    if (sortOrder?.isNotEmpty == true) params['sortOrder'] = sortOrder;

    final res = await apiClient.dioClient.get('/flights', queryParameters: params);

    final data = res.data;
    if (data is! Map<String, dynamic>) return [];

    final raw = data['flights'];
    if (raw == null || raw is! List) return [];

    return raw.map((e) => Flight.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Flight> getFlightById(String id) async {
    final res = await apiClient.dioClient.get('/flights/$id');
    final data = res.data;

    final json = (data is Map<String, dynamic>) ? (data['flight'] ?? data) : null;
    if (json is! Map<String, dynamic>) throw Exception('Invalid flight response');
    return Flight.fromJson(json);
  }
}