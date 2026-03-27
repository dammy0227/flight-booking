class Flight {
  final String  id;
  final String  airline;
  final String  flightNumber;
  final String  departureCity;
  final String  arrivalCity;
  final DateTime departureTime;
  final DateTime arrivalTime;
  final double  price;
  final int     availableSeats;

  Flight({
    required this.id,
    required this.airline,
    required this.flightNumber,
    required this.departureCity,
    required this.arrivalCity,
    required this.departureTime,
    required this.arrivalTime,
    required this.price,
    required this.availableSeats,
  });

  factory Flight.fromJson(Map<String, dynamic> json) => Flight(
    id: json['_id'] as String,
    airline: json['airline'] as String? ?? '',
    flightNumber: json['flightNumber'] as String? ?? '',
    departureCity: json['departureCity'] as String? ?? '',
    arrivalCity: json['arrivalCity'] as String? ?? '',
    departureTime: DateTime.parse(json['departureTime'] as String),
    arrivalTime: DateTime.parse(json['arrivalTime'] as String),
    price: (json['price'] as num).toDouble(),
    availableSeats: (json['availableSeats'] as num).toInt(),
  );

  Map<String, dynamic> toJson() => {
    '_id': id,
    'airline': airline,
    'flightNumber': flightNumber,
    'departureCity': departureCity,
    'arrivalCity': arrivalCity,
    'departureTime': departureTime.toIso8601String(),
    'arrivalTime': arrivalTime.toIso8601String(),
    'price': price,
    'availableSeats': availableSeats,
  };
}