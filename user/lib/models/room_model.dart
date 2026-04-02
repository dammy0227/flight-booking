class Room {
  final String id;
  final String hotelId;
  final String hotelName;
  final String hotelCity;

  final String roomType;
  final double price;
  final int availableRooms;

  final String? description;
  final String? bedType;
  final int? maxOccupancy;
  final String? view;
  final List<String> amenities;

  final List<String> images;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  Room({
    required this.id,
    required this.hotelId,
    required this.hotelName,
    required this.hotelCity,
    required this.roomType,
    required this.price,
    required this.availableRooms,
    this.description,
    this.bedType,
    this.maxOccupancy,
    this.view,
    this.amenities = const [],
    required this.images,
    this.createdAt,
    this.updatedAt,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    final hotelData = json['hotelId'];

    String hotelId = '';
    String hotelName = '';
    String hotelCity = '';

    if (hotelData is Map) {
      hotelId = hotelData['_id'] ?? '';
      hotelName = hotelData['name'] ?? '';
      hotelCity = hotelData['city'] ?? '';
    } else if (hotelData is String) {
      hotelId = hotelData;
    }

    List<String> images = [];
    if (json['images'] != null && json['images'] is List) {
      images = (json['images'] as List)
          .map((img) => img['url']?.toString() ?? "")
          .where((url) => url.isNotEmpty)
          .toList();
    }

    List<String> amenities = [];
    if (json['amenities'] != null && json['amenities'] is List) {
      amenities = List<String>.from(json['amenities']);
    }

    return Room(
      id: json['_id'] ?? '',
      hotelId: hotelId,
      hotelName: hotelName,
      hotelCity: hotelCity,
      roomType: json['roomType'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      availableRooms: json['availableRooms'] ?? 0,
      description: json['description'],
      bedType: json['bedType'],
      maxOccupancy: json['maxOccupancy'],
      view: json['view'],
      amenities: amenities,
      images: images,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
    );
  }
}