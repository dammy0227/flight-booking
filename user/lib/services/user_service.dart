import 'package:get/get.dart';
import '../core/api_client.dart';
import '../models/user_model.dart';

class UserService extends GetxService {
  final ApiClient apiClient = Get.find<ApiClient>();

  Future<User> getUserById(String id) async {
    final res = await apiClient.get('/users/$id');
    final data = res.data;
    if (data is! Map<String, dynamic>) throw Exception('Unexpected response format');
    return User.fromJson(data);
  }

  Future<User> updateProfile({
    required String userId,
    required String name,
    String? imagePath,
  }) async {
    try {
      dynamic res;

      if (imagePath != null) {
        res = await apiClient.putWithFile('/users/$userId', imagePath, {'name': name});
      } else {
        res = await apiClient.put('/users/$userId', {'name': name});
      }

      final data = res.data;
      if (data is! Map<String, dynamic>) throw Exception('Unexpected response format');

      final userJson = data['user'] ?? data;
      if (userJson is! Map<String, dynamic>) throw Exception('Invalid update response');
      return User.fromJson(userJson);
    } catch (e) {
      throw Exception('Failed to update profile: $e');
    }
  }
}