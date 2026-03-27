import 'package:get_storage/get_storage.dart';
import 'package:get/get.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:dio/dio.dart';

import '../core/api_client.dart';
import '../models/user_model.dart';

class AuthService extends GetxService {
  final ApiClient apiClient = Get.find<ApiClient>();
  final box = GetStorage();

  final GoogleSignIn _googleSignIn = GoogleSignIn();

  Future<User> register(
      String name,
      String email,
      String password,
      ) async {
    try {
      final response = await apiClient.post(
        "/users/register",
        {
          "name": name,
          "email": email,
          "password": password,
        },
      );

      final userData = response.data["user"];
      final token = response.data["token"];

      if (token != null) {
        await box.write("token", token);
      }

      return User.fromJson(userData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> login(
      String email,
      String password,
      ) async {
    try {
      final response = await apiClient.post(
        "/users/login",
        {
          "email": email,
          "password": password,
        },
      );

      final userData = response.data["user"];
      final token = response.data["token"];

      if (token != null) {
        await box.write("token", token);
      }

      return User.fromJson(userData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        throw "Google sign-in cancelled";
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      final accessToken = googleAuth.accessToken;
      final idToken = googleAuth.idToken;

      if (accessToken == null || idToken == null) {
        throw "Google authentication failed";
      }

      final credential = fb.GoogleAuthProvider.credential(
        accessToken: accessToken,
        idToken: idToken,
      );

      final userCredential = await fb.FirebaseAuth.instance.signInWithCredential(credential);

      final firebaseUser = userCredential.user;

      if (firebaseUser == null) {
        throw "Firebase authentication failed";
      }

      final firebaseIdToken = await firebaseUser.getIdToken();

      if (firebaseIdToken == null) {
        throw "Failed to get Firebase token";
      }

      final photoURL = firebaseUser.photoURL ?? "";
      final displayName = firebaseUser.displayName ?? "";
      final email = firebaseUser.email ?? "";

      return await firebaseLogin(firebaseIdToken, displayName, photoURL, email);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> firebaseLogin(String idToken, String name, String picture, String email) async {
    try {
      final response = await apiClient.post(
        "/users/firebase",
        {
          "idToken": idToken,
          "name": name,
          "picture": picture,
          "email": email,
        },
      );

      final userData = response.data["user"];
      final token = response.data["token"];

      if (token != null) {
        await box.write("token", token);
      }

      return User.fromJson(userData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    try {
      await box.remove("token");
      await fb.FirebaseAuth.instance.signOut();
      await _googleSignIn.signOut();
    } catch (e) {
      throw "Logout failed";
    }
  }

  String _handleError(dynamic e) {
    if (e is DioException) {
      final res = e.response;

      if (res != null) {
        if (res.data is Map && res.data["message"] != null) {
          return res.data["message"];
        }
        return "Server error: ${res.statusCode}";
      }
      return "Network error: ${e.message}";
    }

    if (e is fb.FirebaseAuthException) {
      return e.message ?? "Firebase error";
    }

    if (e is String) return e;

    return e.toString();
  }
}