import express from "express";
import { body, param, query } from "express-validator";
import {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  searchHotels,
  getHotels,
  getHotelStats,
} from "../controllers/hotel.controller.js";
import { protect, admin } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get(
  "/query",
  query("search").optional().isString(),
  query("city").optional().isString(),
  query("minRating").optional().isFloat({ min: 0, max: 5 }),
  query("maxRating").optional().isFloat({ min: 0, max: 5 }),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("minRooms").optional().isInt({ min: 0 }),
  query("dateFilter").optional().isIn(["new", "updated"]),
  query("sortBy").optional().isIn(["name", "rating", "price", "createdAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
  query("groupBy").optional().isIn(["city"]),
  getHotels
);

router.get("/stats", getHotelStats);

router.get("/search", searchHotels);

router.get("/", getAllHotels);

router.post(
  "/",
  protect,
  admin,
  upload.array("images", 10),
  body("name").notEmpty().withMessage("Hotel name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("address").notEmpty().withMessage("Address is required"),
  createHotel
);

router.get(
  "/:hotelId",
  param("hotelId").isMongoId().withMessage("Invalid hotel ID"),
  getHotelById
);

router.put(
  "/:hotelId",
  protect,
  admin,
  upload.array("images", 10),
  param("hotelId").isMongoId().withMessage("Invalid hotel ID"),
  updateHotel
);

router.delete(
  "/:hotelId",
  protect,
  admin,
  param("hotelId").isMongoId().withMessage("Invalid hotel ID"),
  deleteHotel
);

export default router;