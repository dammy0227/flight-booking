import express from "express";
import { body, param, query } from "express-validator";
import { protect, admin } from "../middlewares/auth.js";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats, 
} from "../controllers/booking.controller.js";

const router = express.Router();

router.get("/stats", protect, admin, getBookingStats);


router.get(
  "/",
  protect,
  query("search").optional().isString(),
  query("type").optional().isIn(["all", "flight", "hotel", "room"]),
  query("status").optional().isIn(["all", "pending", "confirmed", "cancelled"]),
  query("dateFilter").optional().isIn(["today", "week", "month"]),
  query("sortBy").optional().isIn(["newest", "oldest", "highest", "lowest"]),
  query("minPrice").optional().isFloat(),
  query("maxPrice").optional().isFloat(),
  getBookings
);

router.post(
  "/",
  protect,
  [
    body("type").isIn(["flight", "hotel", "room"]).withMessage("type must be flight, hotel, or room"),
    body("referenceId").notEmpty().withMessage("referenceId is required"),
    body("totalPrice").isNumeric().withMessage("totalPrice must be a number"),
  ],
  createBooking
);


router.get(
  "/:bookingId",
  protect,
  param("bookingId").isMongoId().withMessage("Invalid booking ID"),
  getBookingById
);


router.put(
  "/:bookingId/status",
  protect,
  admin,
  param("bookingId").isMongoId().withMessage("Invalid booking ID"),
  body("status")
    .isIn(["pending", "confirmed", "cancelled"])
    .withMessage("Invalid status"),
  updateBookingStatus
);


router.delete(
  "/:bookingId",
  protect,
  admin,
  param("bookingId").isMongoId().withMessage("Invalid booking ID"),
  deleteBooking
);

export default router;