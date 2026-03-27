import 'package:get/get.dart';
import '../models/flight_model.dart';
import '../services/flight_service.dart';

class FlightController extends GetxController {
  final FlightService flightService = Get.find<FlightService>();

  var flights = <Flight>[].obs;
  var displayedFlights = <Flight>[].obs;

  var selectedFlight = Rxn<Flight>();
  var isLoading = false.obs;

  // Filters
  var from = ''.obs;
  var to = ''.obs;
  var date = ''.obs;
  var minPrice = 0.0.obs;
  var maxPrice = 1000.0.obs;
  var minSeats = 1.obs;
  var sortBy = 'departureTime'.obs;
  var sortOrder = 'asc'.obs;
  var selectedClass = 'All'.obs;

  Future<void> fetchFlights({bool forceRefresh = false}) async {
    try {
      if (!forceRefresh && flights.isNotEmpty) return;

      isLoading.value = true;

      final result = await flightService.getFlights(
        from: from.value.isNotEmpty ? from.value : null,
        to: to.value.isNotEmpty ? to.value : null,
        dateFilter: date.value.isNotEmpty ? date.value : null,
        minPrice: minPrice.value > 0 ? minPrice.value : null,
        maxPrice: maxPrice.value < 1000 ? maxPrice.value : null,
        minSeats: minSeats.value > 1 ? minSeats.value : null,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      );

      flights.value = result;

      applyFilters();
    } catch (e) {
      Get.snackbar('Error', e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  void applyFilters() {
    if (selectedClass.value == 'All') {
      displayedFlights.value = flights;
    } else {
      displayedFlights.value = flights;
    }
  }

  void resetFilters() {
    from.value = '';
    to.value = '';
    date.value = '';
    minPrice.value = 0;
    maxPrice.value = 1000;
    minSeats.value = 1;
    sortBy.value = 'departureTime';
    sortOrder.value = 'asc';

    fetchFlights(forceRefresh: true);
  }
}