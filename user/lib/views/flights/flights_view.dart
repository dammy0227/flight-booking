import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/flight_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../core/widgets/empty_state.dart';
import '../../models/flight_model.dart';
import 'flight_details_view.dart';

class FlightsView extends StatefulWidget {
  const FlightsView({super.key});

  @override
  State<FlightsView> createState() => _FlightsViewState();
}

class _FlightsViewState extends State<FlightsView> {
  final FlightController controller = Get.find<FlightController>();
  final TextEditingController fromController = TextEditingController();
  final TextEditingController toController = TextEditingController();
  final TextEditingController dateController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fromController.text = controller.from.value;
    toController.text = controller.to.value;
    dateController.text = controller.date.value;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.fetchFlights();
    });
  }

  @override
  void dispose() {
    fromController.dispose();
    toController.dispose();
    dateController.dispose();
    super.dispose();
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => FilterBottomSheet(controller: controller),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        backgroundColor: AppTheme.card,
        elevation: 0,
        title: const Text('Flights', style: TextStyle(color: AppTheme.cream)),
        centerTitle: true,
        leading: const CustomBackButton(),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: AppTheme.gold),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.displayedFlights.isEmpty) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
            ),
          );
        }

        if (controller.displayedFlights.isEmpty) {
          return EmptyState(
            title: 'No flights found',
            subtitle: 'Try adjusting your search filters',
            icon: Icons.flight_takeoff,
          );
        }

        return Column(
          children: [
            _buildSearchBar(),
            Expanded(
              child: AnimatedPage(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: controller.displayedFlights.length,
                  itemBuilder: (context, index) {
                    final flight = controller.displayedFlights[index];
                    return _buildFlightCard(flight);
                  },
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppTheme.card,
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: fromController,
              style: const TextStyle(color: AppTheme.cream),
              decoration: InputDecoration(
                labelText: 'From',
                labelStyle: const TextStyle(color: AppTheme.muted),
                prefixIcon: const Icon(Icons.flight_takeoff, color: AppTheme.gold, size: 20),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.gold),
                ),
                filled: true,
                fillColor: AppTheme.bg,
              ),
              onSubmitted: (value) {
                controller.from.value = value;
                controller.fetchFlights();
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: toController,
              style: const TextStyle(color: AppTheme.cream),
              decoration: InputDecoration(
                labelText: 'To',
                labelStyle: const TextStyle(color: AppTheme.muted),
                prefixIcon: const Icon(Icons.flight_land, color: AppTheme.gold, size: 20),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.gold),
                ),
                filled: true,
                fillColor: AppTheme.bg,
              ),
              onSubmitted: (value) {
                controller.to.value = value;
                controller.fetchFlights();
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: dateController,
              style: const TextStyle(color: AppTheme.cream),
              decoration: InputDecoration(
                labelText: 'Date',
                labelStyle: const TextStyle(color: AppTheme.muted),
                prefixIcon: const Icon(Icons.calendar_today, color: AppTheme.gold, size: 20),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.gold),
                ),
                filled: true,
                fillColor: AppTheme.bg,
              ),
              readOnly: true,
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                  builder: (context, child) {
                    return Theme(
                      data: Theme.of(context).copyWith(
                        colorScheme: const ColorScheme.dark(
                          primary: AppTheme.gold,
                          onPrimary: AppTheme.bg,
                          surface: AppTheme.card,
                          onSurface: AppTheme.cream,
                        ), dialogTheme: DialogThemeData(backgroundColor: AppTheme.card),
                      ),
                      child: child!,
                    );
                  },
                );
                if (date != null) {
                  dateController.text = date.toIso8601String().split('T')[0];
                  controller.date.value = dateController.text;
                  controller.fetchFlights();
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlightCard(Flight flight) {
    final duration = flight.arrivalTime.difference(flight.departureTime);
    final seatsLow = flight.availableSeats < 10;

    String formatTime(DateTime t) {
      final h = t.hour;
      final m = t.minute.toString().padLeft(2, '0');
      final pm = h >= 12 ? 'PM' : 'AM';
      final dh = h > 12 ? h - 12 : (h == 0 ? 12 : h);
      return '$dh:$m $pm';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Get.to(() => const FlightDetailsView(), arguments: flight);
          },
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.gold.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.gold.withOpacity(0.2)),
                      ),
                      child: const Icon(Icons.flight_rounded, color: AppTheme.gold, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${flight.departureCity} → ${flight.arrivalCity}',
                            style: const TextStyle(
                              color: AppTheme.cream,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            '${flight.airline} · ${flight.flightNumber}',
                            style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '\$${flight.price.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: AppTheme.goldLt,
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          '${flight.availableSeats} seats',
                          style: TextStyle(
                            color: seatsLow ? AppTheme.warning : AppTheme.success,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      formatTime(flight.departureTime),
                      style: const TextStyle(
                        color: AppTheme.cream,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${duration.inHours}h ${duration.inMinutes.remainder(60)}m',
                      style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                    ),
                    Text(
                      formatTime(flight.arrivalTime),
                      style: const TextStyle(
                        color: AppTheme.cream,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          Get.to(() => const FlightDetailsView(), arguments: flight);
                        },
                        style: AppTheme.secondaryButton.copyWith(
                          shape: WidgetStatePropertyAll(
                            RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                        child: const Text('Details'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          Get.toNamed('/booking', arguments: {
                            'type': 'flight',
                            'referenceId': flight.id,
                            'price': flight.price,
                            'quantity': 1,
                            'totalPrice': flight.price,
                            'flightDetails': {
                              'airline': flight.airline,
                              'flightNumber': flight.flightNumber,
                              'from': flight.departureCity,
                              'to': flight.arrivalCity,
                              'departureTime': flight.departureTime.toIso8601String(),
                              'arrivalTime': flight.arrivalTime.toIso8601String(),
                              'departureCity': flight.departureCity,
                              'arrivalCity': flight.arrivalCity,
                            }
                          });
                        },
                        style: AppTheme.primaryButton.copyWith(
                          shape: WidgetStatePropertyAll(
                            RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                        child: const Text('Book', style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class FilterBottomSheet extends StatelessWidget {
  final FlightController controller;

  const FilterBottomSheet({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Filters',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.cream),
          ),
          const SizedBox(height: 16),
          Obx(() => Column(
            children: [
              _buildPriceRangeSlider(),
              const SizedBox(height: 16),
              _buildSeatsSelector(),
              const SizedBox(height: 16),
              _buildClassSelector(),
              const SizedBox(height: 16),
              _buildSortOptions(),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        controller.resetFilters();
                        Navigator.pop(context);
                      },
                      style: AppTheme.secondaryButton.copyWith(
                        shape: WidgetStatePropertyAll(
                          RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      child: const Text('Reset All'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        controller.fetchFlights();
                        Navigator.pop(context);
                      },
                      style: AppTheme.primaryButton.copyWith(
                        shape: WidgetStatePropertyAll(
                          RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      child: const Text('Apply Filters'),
                    ),
                  ),
                ],
              ),
            ],
          )),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildPriceRangeSlider() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Price Range', style: TextStyle(color: AppTheme.cream)),
        RangeSlider(
          values: RangeValues(controller.minPrice.value, controller.maxPrice.value),
          min: 0,
          max: 1000,
          divisions: 100,
          activeColor: AppTheme.gold,
          inactiveColor: AppTheme.muted,
          labels: RangeLabels(
            '\$${controller.minPrice.value.toStringAsFixed(0)}',
            '\$${controller.maxPrice.value.toStringAsFixed(0)}',
          ),
          onChanged: (values) {
            controller.minPrice.value = values.start;
            controller.maxPrice.value = values.end;
          },
        ),
      ],
    );
  }

  Widget _buildSeatsSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Minimum Seats', style: TextStyle(color: AppTheme.cream)),
        Slider(
          value: controller.minSeats.value.toDouble(),
          min: 1,
          max: 10,
          divisions: 9,
          activeColor: AppTheme.gold,
          inactiveColor: AppTheme.muted,
          label: controller.minSeats.value.toString(),
          onChanged: (value) {
            controller.minSeats.value = value.toInt();
          },
        ),
      ],
    );
  }

  Widget _buildClassSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Class', style: TextStyle(color: AppTheme.cream)),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'All', label: Text('All')),
            ButtonSegment(value: 'Economy', label: Text('Economy')),
            ButtonSegment(value: 'Business', label: Text('Business')),
            ButtonSegment(value: 'First', label: Text('First')),
          ],
          selected: {controller.selectedClass.value},
          style: ButtonStyle(
            backgroundColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return AppTheme.gold;
              }
              return AppTheme.bg;
            }),
            foregroundColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return AppTheme.bg;
              }
              return AppTheme.muted;
            }),
          ),
          onSelectionChanged: (Set<String> selection) {
            controller.selectedClass.value = selection.first;
            controller.applyFilters();
          },
        ),
      ],
    );
  }

  Widget _buildSortOptions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Sort By', style: TextStyle(color: AppTheme.cream)),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppTheme.bg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.border),
                ),
                child: DropdownButton<String>(
                  value: controller.sortBy.value,
                  isExpanded: true,
                  dropdownColor: AppTheme.card,
                  underline: const SizedBox(),
                  style: const TextStyle(color: AppTheme.cream),
                  items: const [
                    DropdownMenuItem(value: 'departureTime', child: Text('Departure Time')),
                    DropdownMenuItem(value: 'price', child: Text('Price')),
                    DropdownMenuItem(value: 'availableSeats', child: Text('Available Seats')),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      controller.sortBy.value = value;
                      controller.fetchFlights();
                    }
                  },
                ),
              ),
            ),
            const SizedBox(width: 16),
            Container(
              decoration: BoxDecoration(
                color: AppTheme.bg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: IconButton(
                icon: Obx(() => Icon(
                  controller.sortOrder.value == 'asc'
                      ? Icons.arrow_upward
                      : Icons.arrow_downward,
                  color: AppTheme.gold,
                )),
                onPressed: () {
                  controller.sortOrder.value =
                  controller.sortOrder.value == 'asc' ? 'desc' : 'asc';
                  controller.fetchFlights();
                },
              ),
            ),
          ],
        ),
      ],
    );
  }
}