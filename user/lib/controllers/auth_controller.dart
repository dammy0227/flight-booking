import 'package:get/get.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthController extends GetxController {
  final AuthService authService = Get.find<AuthService>();

  var user = Rxn<User>();
  var isLoading = false.obs;

  // 🔹 Register
  Future<void> register(
      String name,
      String email,
      String password,
      ) async {
    try {
      isLoading.value = true;

      User newUser = await authService.register(name, email, password);
      user.value = newUser;

      Get.snackbar("Success", "Account created successfully");
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // 🔹 Login
  Future<void> login(String email, String password) async {
    try {
      isLoading.value = true;

      User loggedUser = await authService.login(email, password);
      user.value = loggedUser;

      Get.snackbar("Success", "Login successful");
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // 🔥 GOOGLE LOGIN (NEW)
  Future<void> loginWithGoogle() async {
    try {
      isLoading.value = true;

      User loggedUser = await authService.signInWithGoogle();
      user.value = loggedUser;

      Get.snackbar("Success", "Google login successful");
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // 🔹 Logout
  Future<void> logout() async {
    user.value = null;

    await authService.logout();

    Get.offAllNamed("/login");
  }
}