import express from "express";
import { body } from "express-validator";
import { protect, admin } from "../middlewares/auth.js";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("bookingId").notEmpty().withMessage("bookingId is required"),
    body("paymentMethod").isIn(["stripe"]).withMessage("paymentMethod must be stripe"),
    body("token").notEmpty().withMessage("Stripe payment token is required")
  ],
  createPayment
);

router.get("/", protect, admin, getAllPayments);
router.get("/:paymentId", protect, getPaymentById);
router.put("/:paymentId/status", protect, admin, updatePaymentStatus);
router.delete("/:paymentId", protect, admin, deletePayment);

export default router;