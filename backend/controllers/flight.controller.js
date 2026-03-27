import Flight from "../models/flight.model.js";

const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getFlights = async (req, res) => {
  try {
    const {
      search,
      from,
      to,
      dateFilter,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      minSeats,
      sortBy = "departureTime",
      sortOrder = "asc"
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { flightNumber: { $regex: search, $options: "i" } },
        { airline: { $regex: search, $options: "i" } },
        { departureCity: { $regex: search, $options: "i" } },
        { arrivalCity: { $regex: search, $options: "i" } }
      ];
    }

    if (from) {
      query.departureCity = { $regex: from, $options: "i" };
    }

    if (to) {
      query.arrivalCity = { $regex: to, $options: "i" };
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    if (dateFilter === "today") {
      query.departureTime = {
        $gte: getStartOfDay(today),
        $lte: getEndOfDay(today)
      };
    } 
    else if (dateFilter === "tomorrow") {
      query.departureTime = {
        $gte: getStartOfDay(tomorrow),
        $lte: getEndOfDay(tomorrow)
      };
    } 
    else if (dateFilter === "week") {
      query.departureTime = {
        $gte: today,
        $lte: nextWeek
      };
    } 
    else if (dateFilter) {
      const selectedDate = new Date(dateFilter);

      if (!isNaN(selectedDate)) {
        query.departureTime = {
          $gte: getStartOfDay(selectedDate),
          $lte: getEndOfDay(selectedDate)
        };
      }
    }

    if (startDate && endDate) {
      query.departureTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minSeats) {
      query.availableSeats = { $gte: Number(minSeats) };
    }

    const order = sortOrder === "desc" ? -1 : 1;

    let flights = await Flight.find(query).sort({
      [sortBy]: order
    });

    if (flights.length === 0 && (from || to || search)) {
      flights = await Flight.find().sort({ departureTime: 1 });
    }

    res.json({
      message: "Flights fetched successfully",
      count: flights.length,
      flights
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlightStats = async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      totalFlights,
      todayFlights,
      tomorrowFlights,
      weekFlights,
      avgPrice,
      popularRoutes
    ] = await Promise.all([
      Flight.countDocuments(),
      Flight.countDocuments({
        departureTime: {
          $gte: getStartOfDay(today),
          $lte: getEndOfDay(today)
        }
      }),
      Flight.countDocuments({
        departureTime: {
          $gte: getStartOfDay(tomorrow),
          $lte: getEndOfDay(tomorrow)
        }
      }),
      Flight.countDocuments({
        departureTime: {
          $gte: today,
          $lte: nextWeek
        }
      }),
      Flight.aggregate([
        { $group: { _id: null, avg: { $avg: "$price" } } }
      ]),
      Flight.aggregate([
        {
          $group: {
            _id: { from: "$departureCity", to: "$arrivalCity" },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const stats = {
      totalFlights,
      todayFlights,
      tomorrowFlights,
      weekFlights,
      avgPrice: Math.round(avgPrice[0]?.avg || 0),
      popularRoutes: popularRoutes.map((route) => ({
        from: route._id.from,
        to: route._id.to,
        count: route.count
      }))
    };

    res.json({ stats });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFlight = async (req, res) => {
  try {
    const {
      airline,
      flightNumber,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      price,
      availableSeats
    } = req.body;

    const exists = await Flight.findOne({ flightNumber });

    if (exists) {
      return res.status(400).json({
        message: "Flight number already exists"
      });
    }

    const flight = await Flight.create({
      airline,
      flightNumber,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      price,
      availableSeats
    });

    res.status(201).json({
      message: "Flight created successfully",
      flight
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.flightId);

    if (!flight) {
      return res.status(404).json({
        message: "Flight not found"
      });
    }

    res.json({ flight });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFlight = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const flight = await Flight.findByIdAndUpdate(
      req.params.flightId,
      updateData,
      { new: true }
    );

    if (!flight) {
      return res.status(404).json({
        message: "Flight not found"
      });
    }

    res.json({
      message: "Flight updated successfully",
      flight
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.flightId);

    if (!flight) {
      return res.status(404).json({
        message: "Flight not found"
      });
    }

    res.json({
      message: "Flight deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};