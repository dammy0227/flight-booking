import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { auth } from "../config/firebase.js";

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const uploadFromBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "users" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const firebaseAuth = async (req, res) => {
  try {
    const { idToken, name, picture, email } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "No Firebase ID token provided" });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid } = decodedToken;
    const userName = name || decodedToken.name || "Firebase User";
    const userEmail = email || decodedToken.email;
    const userPicture = picture || decodedToken.picture || "";

    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: userEmail,
        name: userName,
        image: userPicture,
      });
    } else if (!user.image && userPicture) {
      user.image = userPicture;
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      message: "Firebase authentication successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error("Firebase error:", error.message);
    res.status(500).json({ message: "Firebase authentication failed" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ message: "All users fetched", users });
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.email) updateData.email = req.body.email;

    if (req.file?.buffer) {
      const result = await uploadFromBuffer(req.file.buffer);
      updateData.image = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};