import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["card", "paypal", "stripe"], default: "stripe" },
    status: { type: String, enum: ["paid", "failed", "pending"], default: "pending" },
    transactionId: { type: String },
    receiptUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;