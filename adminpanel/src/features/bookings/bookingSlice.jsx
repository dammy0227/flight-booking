import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as bookingService from "../../services/booking";

const initialState = {
  bookings: [],
  groupedBookings: [],
  selectedBooking: null,
  stats: {
    totalBookings: 0,
    totalRevenue: 0,
    flightBookings: 0,
    hotelBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
  },
  loading: false,
  error: null,
};

export const getBookings = createAsyncThunk(
  "bookings/getBookings",
  async (params = {}, thunkAPI) => {
    try {
      const res = await bookingService.getBookings(params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }
);

export const getBookingStats = createAsyncThunk(
  "bookings/getBookingStats",
  async (_, thunkAPI) => {
    try {
      const res = await bookingService.getBookingStats();
      return res.data.stats;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

export const getBookingById = createAsyncThunk(
  "bookings/getBookingById",
  async (id, thunkAPI) => {
    try {
      const res = await bookingService.getBookingById(id);
      return res.data.booking;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  }
);

export const searchBookings = createAsyncThunk(
  "bookings/searchBookings",
  async (params, thunkAPI) => {
    try {
      const res = await bookingService.searchBookings(params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Booking search failed"
      );
    }
  }
);

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (data, thunkAPI) => {
    try {
      const res = await bookingService.createBooking(data);
      return res.data.booking;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Booking creation failed"
      );
    }
  }
);

export const updateBooking = createAsyncThunk(
  "bookings/updateBooking",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await bookingService.updateBooking(id, data);
      return res.data.booking;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Booking update failed"
      );
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await bookingService.updateBookingStatus(id, data);
      return res.data.booking;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Booking status update failed"
      );
    }
  }
);

export const deleteBooking = createAsyncThunk(
  "bookings/deleteBooking",
  async (id, thunkAPI) => {
    try {
      await bookingService.deleteBooking(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Booking deletion failed"
      );
    }
  }
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    resetBookingsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        const bookingsData = action.payload.bookings;

        if (Array.isArray(bookingsData)) {
          state.bookings = bookingsData;
          state.groupedBookings = [];
        } else {
          state.groupedBookings = bookingsData;
          state.bookings = [];
        }
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getBookingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(searchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBookings.fulfilled, (state, action) => {
        state.loading = false;
        const bookingsData = action.payload.bookings;
        
        if (Array.isArray(bookingsData)) {
          state.bookings = bookingsData;
          state.groupedBookings = [];
        } else {
          state.groupedBookings = bookingsData;
          state.bookings = [];
        }
      })
      .addCase(searchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        );
        if (
          state.selectedBooking &&
          state.selectedBooking._id === action.payload._id
        ) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        );
        if (
          state.selectedBooking &&
          state.selectedBooking._id === action.payload._id
        ) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(
          (booking) => booking._id !== action.payload
        );
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedBooking,
  resetBookingsState,
} = bookingSlice.actions;

export default bookingSlice.reducer;