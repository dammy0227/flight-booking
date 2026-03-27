import mongoose from "mongoose";

const flightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true, unique: true },
  departureCity: { type: String, required: true },
  arrivalCity: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
}, { timestamps: true });

const Flight = mongoose.model("Flight", flightSchema);
export default Flight;