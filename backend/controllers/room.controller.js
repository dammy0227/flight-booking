import Room from "../models/room.model.js";
import Hotel from "../models/hotel.model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "rooms" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const createRoom = async (req, res) => {
  try {
    const {
      hotelId,
      roomType,
      price,
      availableRooms,
      amenities,
      description,
      roomNumber,
      floor,
      bedType,
      maxOccupancy,
      view,
    } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const images = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const result = await uploadFromBuffer(file.buffer);
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    let amenitiesArray = amenities;
    if (typeof amenities === "string") {
      try {
        amenitiesArray = JSON.parse(amenities);
      } catch {
        amenitiesArray = [];
      }
    }

    const room = new Room({
      hotelId,
      roomType,
      price: Number(price),
      availableRooms: Number(availableRooms),
      amenities: amenitiesArray || [],
      images,
      description,
      roomNumber,
      floor: floor ? Number(floor) : undefined,
      bedType,
      maxOccupancy: maxOccupancy ? Number(maxOccupancy) : 2,
      view,
    });

    await room.save();

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({
      message: "Failed to create room",
      error: error.message,
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { search, hotel, availability, sort } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { roomType: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { roomNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (hotel) {
      query.hotelId = hotel;
    }

    if (availability === "available") {
      query.availableRooms = { $gt: 0 };
    } else if (availability === "low") {
      query.availableRooms = { $gt: 0, $lt: 5 };
    } else if (availability === "full") {
      query.availableRooms = 0;
    }

    let roomsQuery = Room.find(query).populate("hotelId", "name city address rating");

    if (sort === "price-low") roomsQuery = roomsQuery.sort({ price: 1 });
    if (sort === "price-high") roomsQuery = roomsQuery.sort({ price: -1 });
    if (sort === "available") roomsQuery = roomsQuery.sort({ availableRooms: -1 });
    if (sort === "newest") roomsQuery = roomsQuery.sort({ createdAt: -1 });

    const rooms = await roomsQuery;

    res.json({
      message: "Rooms fetched successfully",
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "hotelId",
      "name city address description rating amenities images"
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.json({
      message: "Room fetched successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const {
      roomType,
      price,
      availableRooms,
      amenities,
      description,
      roomNumber,
      floor,
      bedType,
      maxOccupancy,
      view,
    } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (req.files?.length > 0) {
      if (room.images?.length > 0) {
        for (const img of room.images) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      const images = [];
      for (const file of req.files) {
        const result = await uploadFromBuffer(file.buffer);
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
      room.images = images;
    }

    let amenitiesArray = amenities;
    if (amenities && typeof amenities === "string") {
      try {
        amenitiesArray = JSON.parse(amenities);
      } catch {
        amenitiesArray = [];
      }
    }

    room.roomType = roomType || room.roomType;
    room.price = price !== undefined ? Number(price) : room.price;
    room.availableRooms = availableRooms !== undefined ? Number(availableRooms) : room.availableRooms;
    room.amenities = amenitiesArray || room.amenities;
    room.description = description !== undefined ? description : room.description;
    room.roomNumber = roomNumber !== undefined ? roomNumber : room.roomNumber;
    room.floor = floor !== undefined ? Number(floor) : room.floor;
    room.bedType = bedType || room.bedType;
    room.maxOccupancy = maxOccupancy !== undefined ? Number(maxOccupancy) : room.maxOccupancy;
    room.view = view !== undefined ? view : room.view;

    await room.save();

    res.json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({
      message: "Failed to update room",
      error: error.message,
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.images?.length > 0) {
      for (const img of room.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await room.deleteOne();

    res.json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

export const getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();

    const availableRooms = await Room.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$availableRooms" },
        },
      },
    ]);

    const avgPrice = await Room.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: "$price" },
        },
      },
    ]);

    const roomTypes = await Room.distinct("roomType");

    const bedTypeStats = await Room.aggregate([
      {
        $group: {
          _id: "$bedType",
          count: { $sum: 1 },
          totalAvailable: { $sum: "$availableRooms" },
        },
      },
    ]);

    res.json({
      stats: {
        totalRooms,
        totalAvailable: availableRooms[0]?.total || 0,
        avgPrice: Math.round(avgPrice[0]?.avg || 0),
        roomTypes: roomTypes.length,
        bedTypes: bedTypeStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};

export const getRoomsGroupedByHotel = async (req, res) => {
  try {
    const rooms = await Room.find().populate("hotelId", "name city address rating");

    const grouped = {};

    rooms.forEach((room) => {
      const hotelName = room.hotelId?.name || "Unknown Hotel";
      const hotelId = room.hotelId?._id || "unknown";

      if (!grouped[hotelId]) {
        grouped[hotelId] = {
          hotelId,
          hotelName,
          hotelCity: room.hotelId?.city,
          hotelRating: room.hotelId?.rating,
          rooms: [],
          totalRooms: 0,
          availableRooms: 0,
        };
      }

      grouped[hotelId].rooms.push(room);
      grouped[hotelId].totalRooms++;
      grouped[hotelId].availableRooms += room.availableRooms;
    });

    res.json({
      groupedRooms: Object.values(grouped),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to group rooms",
      error: error.message,
    });
  }
};