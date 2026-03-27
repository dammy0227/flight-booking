class Payment {
  final String id;
  final String bookingId;
  final double amount;
  final String paymentMethod;
  final String status;
  final String? transactionId;
  final String? receiptUrl;

  Payment({
    required this.id,
    required this.bookingId,
    required this.amount,
    this.paymentMethod = "stripe",
    this.status = "pending",
    this.transactionId,
    this.receiptUrl,
  });

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
    id: json['_id'],
    bookingId: json['bookingId'] is Map
        ? json['bookingId']['_id']
        : json['bookingId'],
    amount: (json['amount'] as num).toDouble(),
    paymentMethod: json['paymentMethod'] ?? "stripe",
    status: json['status'] ?? "pending",
    transactionId: json['transactionId'],
    receiptUrl: json['receiptUrl'],
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "bookingId": bookingId,
    "amount": amount,
    "paymentMethod": paymentMethod,
    "status": status,
    "transactionId": transactionId,
    "receiptUrl": receiptUrl,
  };
}