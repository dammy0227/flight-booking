import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true
  },
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  availableRooms: { type: Number, required: true },
  amenities: [{ type: String }],
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
  description: { type: String },
  roomNumber: { type: String },
  floor: { type: Number },
  bedType: { type: String, enum: ["Single", "Double", "Queen", "King", "Twin"], default: "Double" },
  maxOccupancy: { type: Number, default: 2 },
  view: { type: String },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;