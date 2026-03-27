import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  rating: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  roomsAvailable: { type: Number, default: 0 },
  amenities: [{ type: String }],
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
}, { timestamps: true });

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;