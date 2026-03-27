import express from "express";
import { body, param } from "express-validator";
import {
  registerUser,
  loginUser,
  firebaseAuth,
  getUserById,
  updateProfile,
  getAllUsers
} from "../controllers/user.controller.js";
import { protect, admin } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/register",
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  registerUser
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  loginUser
);

router.post("/firebase", body("idToken").notEmpty().withMessage("Firebase ID token is required"), firebaseAuth);

router.get("/", protect, admin, getAllUsers);

router.get(
  "/:userId",
  protect,
  param("userId").isMongoId().withMessage("Invalid user ID"),
  getUserById
);

router.put(
  "/:userId",
  protect,
  param("userId").isMongoId().withMessage("Invalid user ID"),
  upload.single("image"),
  updateProfile
);

export default router;