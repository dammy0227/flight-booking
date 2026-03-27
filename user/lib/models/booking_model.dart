class Booking {
  final String id;
  final String userId;
  final String type;
  final String referenceId;
  final int quantity;
  final double totalPrice;
  final String paymentStatus;
  final String status;
  final DateTime createdAt;
  final Map<String, dynamic>? reference;

  Booking({
    required this.id,
    required this.userId,
    required this.type,
    required this.referenceId,
    this.quantity = 1,
    required this.totalPrice,
    this.paymentStatus = "unpaid",
    this.status = "pending",
    required this.createdAt,
    this.reference,
  });

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
    id: json['_id'],
    userId: json['userId'] is Map ? json['userId']['_id'] : json['userId'],
    type: json['type'],
    referenceId: json['referenceId'],
    quantity: json['quantity'] ?? 1,
    totalPrice: (json['totalPrice'] as num).toDouble(),
    paymentStatus: json['paymentStatus'] ?? "unpaid",
    status: json['status'] ?? "pending",
    createdAt: DateTime.parse(json['createdAt']),
    reference: json['reference'],
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "userId": userId,
    "type": type,
    "referenceId": referenceId,
    "quantity": quantity,
    "totalPrice": totalPrice,
    "paymentStatus": paymentStatus,
    "status": status,
    "createdAt": createdAt.toIso8601String(),
  };
}