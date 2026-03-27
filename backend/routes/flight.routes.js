import express from "express";
import { body, param, query } from "express-validator";

import {
  getFlights,
  getFlightStats,
  createFlight,
  getFlightById,
  updateFlight,
  deleteFlight
} from "../controllers/flight.controller.js";

import { protect, admin } from "../middlewares/auth.js";

const router = express.Router();


router.get(
  "/",
  query("search").optional().isString(),
  query("from").optional().isString(),
  query("to").optional().isString(),
  query("dateFilter").optional().isIn(["today", "tomorrow", "week"]),
  query("minPrice").optional().isFloat(),
  query("maxPrice").optional().isFloat(),
  query("minSeats").optional().isInt(),
  query("sortBy").optional().isIn(["price", "departureTime", "availableSeats"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
  getFlights
);


router.get("/stats", getFlightStats);


router.post(
  "/",
  protect,
  admin,

  body("airline").notEmpty(),
  body("flightNumber").notEmpty(),
  body("departureCity").notEmpty(),
  body("arrivalCity").notEmpty(),
  body("departureTime").isISO8601(),
  body("arrivalTime").isISO8601(),
  body("price").isFloat({ gt: 0 }),
  body("availableSeats").isInt({ gt: 0 }),

  createFlight
);


router.get(
  "/:flightId",
  param("flightId").isMongoId(),
  getFlightById
);


router.put(
  "/:flightId",
  protect,
  admin,
  param("flightId").isMongoId(),
  updateFlight
);


router.delete(
  "/:flightId",
  protect,
  admin,
  param("flightId").isMongoId(),
  deleteFlight
);



export default router;