import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import stripe from "../config/stripe.js";
import cloudinary from "../config/cloudinary.js";

export const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, token } = req.body;

    const booking = await Booking.findById(bookingId).populate("userId", "name email");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking is already paid" });
    }

    const amountInCents = Math.round(booking.totalPrice * 100);

    let charge;

    if (paymentMethod === "stripe") {
      charge = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        payment_method: token,
        confirm: true,

        return_url: "https://example.com",
      });
    } else {
      return res.status(400).json({ message: "Unsupported payment method" });
    }

    
    if (charge.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment requires additional authentication",
      });
    }

    const payment = new Payment({
      bookingId,
      amount: booking.totalPrice,
      paymentMethod,
      status: "paid",
      transactionId: charge.id,
    });

    await payment.save();

    booking.paymentStatus = "paid";
    await booking.save();

    const receiptData = {
      bookingId: booking._id,
      user: booking.userId,
      amount: payment.amount,
      paymentMethod,
      transactionId: payment.transactionId,
      date: new Date(),
    };

    const receiptUpload = await cloudinary.uploader.upload(
      `data:text/plain;base64,${Buffer.from(JSON.stringify(receiptData)).toString("base64")}`,
      { folder: "receipts", resource_type: "raw" }
    );

    payment.receiptUrl = receiptUpload.secure_url;
    await payment.save();

    res.status(201).json({ success: true, payment });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { search, status, method, sortBy, dateFilter } = req.query;

    let query = Payment.find().populate({
      path: "bookingId",
      populate: { path: "userId", select: "name email" }
    });

    if (search) {
      const regex = new RegExp(search, "i");
      query = query.where({
        $or: [
          { transactionId: regex },
          { "bookingId._id": regex },
          { "bookingId.userId.name": regex },
          { "bookingId.userId.email": regex },
        ]
      });
    }

    if (status && status !== "all") {
      query = query.where("status").equals(status);
    }

    if (method && method !== "all") {
      query = query.where("paymentMethod").equals(method);
    }

    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      let fromDate;
      if (dateFilter === "today") {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateFilter === "week") {
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        fromDate = new Date();
        fromDate.setMonth(now.getMonth() - 1);
      }
      query = query.where("createdAt").gte(fromDate);
    }

    if (sortBy) {
      if (sortBy === "newest") query = query.sort({ createdAt: -1 });
      else if (sortBy === "oldest") query = query.sort({ createdAt: 1 });
      else if (sortBy === "highest") query = query.sort({ amount: -1 });
      else if (sortBy === "lowest") query = query.sort({ amount: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const payments = await query;

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate({
        path: "bookingId",
        populate: { path: "userId", select: "name email" }
      });

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    payment.status = status;
    await payment.save();

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    await payment.remove();
    res.json({ success: true, message: "Payment deleted", id: req.params.paymentId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};