import { configureStore } from "@reduxjs/toolkit";

import userReducer from "../features/users/userSlice";
import flightReducer from "../features/flights/flightSlice";
import hotelReducer from "../features/hotels/hotelSlice";
import roomReducer from "../features/rooms/roomSlice";
import bookingReducer from "../features/bookings/bookingSlice";
import paymentReducer from "../features/payments/paymentSlice";

export const store = configureStore({
  reducer: {
    users: userReducer,
    flights: flightReducer,
    hotels: hotelReducer,
    rooms: roomReducer,
    bookings: bookingReducer,
    payments: paymentReducer,
  },
});