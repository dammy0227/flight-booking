import 'package:dio/dio.dart' as dio;
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

class ApiClient {
  late dio.Dio dioClient;
  final storage = GetStorage();

  final String baseUrl = "https://flight-booking-13jt.onrender.com/api";

  ApiClient() {
    dioClient = dio.Dio(
      dio.BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      ),
    );

    dioClient.interceptors.add(
      dio.InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = storage.read("token");

          if (token != null) {
            options.headers["Authorization"] = "Bearer $token";
          }

          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            storage.remove("token");

            Get.snackbar(
              "Session Expired",
              "Please login again",
              snackPosition: SnackPosition.BOTTOM,
            );

            Get.offAllNamed("/login");
          }

          return handler.next(error);
        },
      ),
    );
  }

  Future<dio.Response> get(String url) async {
    try {
      return await dioClient.get(url);
    } catch (e) {
      rethrow;
    }
  }

  Future<dio.Response> post(String url, dynamic data) async {
    try {
      return await dioClient.post(url, data: data);
    } catch (e) {
      rethrow;
    }
  }

  Future<dio.Response> put(String url, dynamic data) async {
    try {
      return await dioClient.put(url, data: data);
    } catch (e) {
      rethrow;
    }
  }

  Future<dio.Response> delete(String url) async {
    try {
      return await dioClient.delete(url);
    } catch (e) {
      rethrow;
    }
  }

  Future<dio.Response> putWithFile(
      String url,
      String filePath,
      Map<String, dynamic> data,
      ) async {
    try {
      final formData = dio.FormData.fromMap({
        ...data,
        'image': await dio.MultipartFile.fromFile(filePath),
      });

      return await dioClient.put(url, data: formData);
    } catch (e) {
      rethrow;
    }
  }
}