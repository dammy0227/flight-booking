class HotelImage {
  final String url;
  final String publicId;

  HotelImage({required this.url, required this.publicId});

  factory HotelImage.fromJson(Map<String, dynamic> json) => HotelImage(
    url:      json['url']       as String? ?? '',
    publicId: json['public_id'] as String? ?? '',
  );
}

class Hotel {
  final String        id;
  final String        name;
  final String        city;
  final String        address;
  final String?       description;
  final double        rating;
  final double        price;
  final int           roomsAvailable;
  final List<String>  amenities;
  final List<HotelImage> images;

  Hotel({
    required this.id,
    required this.name,
    required this.city,
    required this.address,
    this.description,
    required this.rating,
    required this.price,
    required this.roomsAvailable,
    required this.amenities,
    required this.images,
  });

  factory Hotel.fromJson(Map<String, dynamic> json) => Hotel(
    id:             json['_id']            as String,
    name:           json['name']           as String? ?? '',
    city:           json['city']           as String? ?? '',
    address:        json['address']        as String? ?? '',
    description:    json['description']    as String?,
    rating:         (json['rating']        as num?)?.toDouble() ?? 0.0,
    price:          (json['price']         as num?)?.toDouble() ?? 0.0,
    roomsAvailable: (json['roomsAvailable']as num?)?.toInt()    ?? 0,
    amenities: (json['amenities'] as List<dynamic>?)
        ?.map((e) => e as String)
        .toList() ?? [],
    images: (json['images'] as List<dynamic>?)
        ?.map((e) => HotelImage.fromJson(e as Map<String, dynamic>))
        .toList() ?? [],
  );

  Map<String, dynamic> toJson() => {
    '_id':           id,
    'name':          name,
    'city':          city,
    'address':       address,
    'description':   description,
    'rating':        rating,
    'price':         price,
    'roomsAvailable':roomsAvailable,
    'amenities':     amenities,
    'images':        images.map((i) => {'url': i.url, 'public_id': i.publicId}).toList(),
  };
}