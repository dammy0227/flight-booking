class User {
  final String id;
  final String name;
  final String email;
  final String? firebaseUid;
  final String image;
  final String role;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.firebaseUid,
    this.image = "",
    this.role = "user",
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['_id'] ?? json['id'],
    name: json['name'] ?? "",
    email: json['email'] ?? "",
    firebaseUid: json['firebaseUid'],
    image: json['image'] ?? "",
    role: json['role'] ?? "user",
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "name": name,
    "email": email,
    "firebaseUid": firebaseUid,
    "image": image,
    "role": role,
  };
}