import express from "express";
import { body, param, query } from "express-validator";
import { upload } from "../middlewares/upload.js"; 
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomStats,
  getRoomsGroupedByHotel
} from "../controllers/room.controller.js";
import { protect, admin } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/",
  protect,
  admin,
  upload.array("images", 10),
  body("hotelId")
    .notEmpty()
    .withMessage("Hotel ID is required")
    .isMongoId(),
  body("roomType")
    .notEmpty()
    .withMessage("Room type is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 }),
  body("availableRooms")
    .notEmpty()
    .withMessage("Available rooms is required")
    .isInt({ min: 0 }),
  createRoom
);


router.get("/stats", getRoomStats);

router.get("/grouped", getRoomsGroupedByHotel);

router.get(
  "/",
  query("search").optional().isString(),
  query("hotel").optional().isString(),
  query("availability").optional().isString(),
  query("sort").optional().isString(),
  getRooms
);


router.get(
  "/:id",
  param("id")
    .isMongoId()
    .withMessage("Invalid room ID"),
  getRoomById
);

router.put(
  "/:id",
  protect,
  admin,
  upload.array("images", 10), 
  param("id")
    .isMongoId()
    .withMessage("Invalid room ID"),
  updateRoom
);


router.delete(
  "/:id",
  protect,
  admin,
  param("id")
    .isMongoId()
    .withMessage("Invalid room ID"),
  deleteRoom
);

export default router;