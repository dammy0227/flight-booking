import 'package:get/get.dart';
import '../models/user_model.dart';
import '../services/user_service.dart';
import 'auth_controller.dart';

class UserController extends GetxController {
  final UserService userService = Get.find<UserService>();
  final AuthController authCtrl = Get.find<AuthController>();

  var profile = Rxn<User>();
  var isLoading = false.obs;

  Future<void> fetchProfile(String userId) async {
    try {
      isLoading.value = true;
      profile.value = await userService.getUserById(userId);
    } catch (e) {
      Get.snackbar('Error', e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> updateProfile({
    required String userId,
    required String name,
    String? imagePath,
  }) async {
    try {
      isLoading.value = true;
      final updated = await userService.updateProfile(
        userId: userId,
        name: name,
        imagePath: imagePath,
      );

      profile.value = updated;
      authCtrl.user.value = updated;

      Get.snackbar('Success', 'Profile updated successfully');
      return true;
    } catch (e) {
      Get.snackbar('Error', e.toString());
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}