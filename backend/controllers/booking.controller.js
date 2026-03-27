import Booking from "../models/booking.model.js";
import Flight from "../models/flight.model.js";
import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js"; 
import User from "../models/user.model.js";

const getDateRange = (filter) => {
  const now = new Date();
  const start = new Date(now);

  switch (filter) {
    case "today":
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    case "week":
      start.setDate(now.getDate() - 7);
      return { $gte: start };
    case "month":
      start.setMonth(now.getMonth() - 1);
      return { $gte: start };
    default:
      return null;
  }
};


const populateReference = async (booking) => {
  if (booking.type === "flight") {
    booking.reference = await Flight.findById(booking.referenceId).lean();
  } else if (booking.type === "hotel") {
    booking.reference = await Hotel.findById(booking.referenceId).lean();
  } else if (booking.type === "room") {
    booking.reference = await Room.findById(booking.referenceId).lean();
  }
  return booking;
};


export const getBookings = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";

    const {
      search,
      type,
      status,
      dateFilter,
      sortBy,
      userId,
      startDate,
      endDate,
      minPrice,
      maxPrice,
    } = req.query;

    const query = {};

    if (isAdmin) {
      if (userId) query.userId = userId;
    } else {
      query.userId = req.user.id;
    }

    if (type && type !== "all") query.type = type;
    if (status && status !== "all") query.status = status;

    if (minPrice || maxPrice) {
      query.totalPrice = {};
      if (minPrice) query.totalPrice.$gte = Number(minPrice);
      if (maxPrice) query.totalPrice.$lte = Number(maxPrice);
    }

    const dateRange = getDateRange(dateFilter);
    if (dateRange) query.createdAt = dateRange;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

 
    if (search && isAdmin) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      });

      if (users.length > 0) {
        query.userId = { $in: users.map((u) => u._id) };
      } else if (/^[0-9a-fA-F]{24}$/.test(search)) {
        query._id = search;
      } else {
        return res.json({ message: "Bookings fetched successfully", bookings: [] });
      }
    }

    
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { totalPrice: -1 },
      lowest: { totalPrice: 1 },
    };

    const sort = sortMap[sortBy] || { createdAt: -1 };

  
    let bookings = await Booking.find(query)
      .populate("userId", "name email")
      .sort(sort)
      .lean();

    bookings = await Promise.all(bookings.map(populateReference));

    res.json({ message: "Bookings fetched successfully", bookings });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getBookingStats = async (req, res) => {
  try {
    const [
      totalBookings,
      totalRevenue,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      flightBookings,
      hotelBookings,
      roomBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ type: "flight" }),
      Booking.countDocuments({ type: "hotel" }),
      Booking.countDocuments({ type: "room" }),
    ]);

    res.json({
      stats: {
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        flightBookings,
        hotelBookings,
        roomBookings,
      },
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { type, referenceId, quantity, totalPrice } = req.body;

    const userId = req.user.id;

   
    if (!["flight", "hotel", "room"].includes(type)) {
      return res.status(400).json({ message: "Invalid booking type" });
    }

  
    const reference =
      type === "flight"
        ? await Flight.findById(referenceId)
        : type === "hotel"
        ? await Hotel.findById(referenceId)
        : await Room.findById(referenceId);

    if (!reference) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const booking = await Booking.create({
      userId,
      type,
      referenceId,
      quantity,
      totalPrice,
    });

    await booking.populate("userId", "name email");

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("userId", "name email")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && booking.userId?._id?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await populateReference(booking);

    res.json({ booking });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status },
      { new: true }
    )
      .populate("userId", "name email")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await populateReference(booking);

    res.json({ message: "Booking status updated", booking });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

