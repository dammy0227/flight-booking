import Hotel from "../models/hotel.model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hotels" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const getDateRange = (filter) => {
  const now = new Date();
  const start = new Date(now);

  switch (filter) {
    case "new":
      start.setDate(now.getDate() - 7);
      return { $gte: start };
    case "updated":
      start.setDate(now.getDate() - 3);
      return { $gte: start };
    default:
      return null;
  }
};

export const getHotels = async (req, res) => {
  try {
    const {
      search,
      city,
      minRating,
      maxRating,
      minPrice,
      maxPrice,
      minRooms,
      dateFilter,
      sortBy = "createdAt",
      sortOrder = "desc",
      groupBy
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }

    if (city && city !== "all") {
      query.city = city;
    }

    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = Number(minRating);
      if (maxRating) query.rating.$lte = Number(maxRating);
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRooms) {
      query.roomsAvailable = { $gte: Number(minRooms) };
    }

    const dateRange = getDateRange(dateFilter);
    if (dateRange) {
      if (dateFilter === "new") {
        query.createdAt = dateRange;
      } else if (dateFilter === "updated") {
        query.updatedAt = dateRange;
      }
    }

    const order = sortOrder === "desc" ? -1 : 1;
    let hotels = await Hotel.find(query).sort({ [sortBy]: order });

    if (groupBy === "city") {
      const grouped = {};
      hotels.forEach((hotel) => {
        if (!grouped[hotel.city]) {
          grouped[hotel.city] = {
            city: hotel.city,
            hotels: [],
            count: 0
          };
        }
        grouped[hotel.city].hotels.push(hotel);
        grouped[hotel.city].count++;
      });
      return res.json({
        message: "Hotels fetched successfully",
        hotels: Object.values(grouped)
      });
    }

    res.json({
      message: "Hotels fetched successfully",
      count: hotels.length,
      hotels
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHotelStats = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalHotels,
      avgRating,
      cities,
      highRated,
      newThisWeek
    ] = await Promise.all([
      Hotel.countDocuments(),
      Hotel.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
      Hotel.distinct("city"),
      Hotel.countDocuments({ rating: { $gte: 4 } }),
      Hotel.countDocuments({ createdAt: { $gte: weekAgo } })
    ]);

    res.json({
      stats: {
        totalHotels,
        avgRating: Math.round(avgRating[0]?.avg || 0),
        totalCities: cities.length,
        highRated,
        newThisWeek
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHotel = async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      description,
      rating,
      price,
      roomsAvailable,
      amenities
    } = req.body;

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

    const hotel = await Hotel.create({
      name,
      city,
      address,
      description,
      rating: rating || 0,
      price: price || 0,
      roomsAvailable: roomsAvailable || 0,
      amenities: amenitiesArray || [],
      images
    });

    res.status(201).json({
      message: "Hotel created successfully",
      hotel
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({
      message: "All hotels fetched",
      hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json({ hotel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    if (req.files?.length > 0) {
      if (hotel.images?.length > 0) {
        for (const img of hotel.images) {
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
      updateData.images = images;
    }

    if (updateData.amenities && typeof updateData.amenities === "string") {
      try {
        updateData.amenities = JSON.parse(updateData.amenities);
      } catch {
        updateData.amenities = [];
      }
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.hotelId,
      updateData,
      { new: true }
    );

    res.json({
      message: "Hotel updated successfully",
      hotel: updatedHotel
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    if (hotel.images?.length > 0) {
      for (const img of hotel.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await hotel.deleteOne();
    res.json({ message: "Hotel deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchHotels = async (req, res) => {
  try {
    const { name, city, minRating, maxRating } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: "i" };
    if (city) query.city = { $regex: city, $options: "i" };

    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = Number(minRating);
      if (maxRating) query.rating.$lte = Number(maxRating);
    }

    const hotels = await Hotel.find(query);
    res.json({
      message: "Hotels fetched",
      hotels
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};