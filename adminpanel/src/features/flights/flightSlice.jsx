import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as flightService from "../../services/flight";

const initialState = {
  flights: [],
  groupedFlights: [],
  selectedFlight: null,
  stats: {
    totalFlights: 0,
    todayFlights: 0,
    tomorrowFlights: 0,
    weekFlights: 0,
    avgPrice: 0,
    popularRoutes: []
  },
  loading: false,
  error: null,
};

export const getFlights = createAsyncThunk(
  "flights/getFlights",
  async (params = {}, thunkAPI) => {
    try {
      const res = await flightService.queryFlights(params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch flights"
      );
    }
  }
);

export const getFlightStats = createAsyncThunk(
  "flights/getFlightStats",
  async (_, thunkAPI) => {
    try {
      const res = await flightService.getFlightStats();
      return res.data.stats;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

export const getFlightById = createAsyncThunk(
  "flights/getFlightById",
  async (id, thunkAPI) => {
    try {
      const res = await flightService.getFlightById(id);
      return res.data.flight;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch flight"
      );
    }
  }
);

export const createFlight = createAsyncThunk(
  "flights/createFlight",
  async (data, thunkAPI) => {
    try {
      const res = await flightService.createFlight(data);
      return res.data.flight;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Flight creation failed"
      );
    }
  }
);

export const updateFlight = createAsyncThunk(
  "flights/updateFlight",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await flightService.updateFlight(id, data);
      return res.data.flight;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Flight update failed"
      );
    }
  }
);

export const deleteFlight = createAsyncThunk(
  "flights/deleteFlight",
  async (id, thunkAPI) => {
    try {
      await flightService.deleteFlight(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Flight deletion failed"
      );
    }
  }
);

const flightSlice = createSlice({
  name: "flights",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedFlight: (state) => {
      state.selectedFlight = null;
    },
    resetFlightsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFlights.fulfilled, (state, action) => {
        state.loading = false;
        const flightsData = action.payload.flights;

        if (Array.isArray(flightsData)) {
          state.flights = flightsData;
          state.groupedFlights = [];
        } else {
          state.groupedFlights = flightsData;
          state.flights = [];
        }
      })
      .addCase(getFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getFlightStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      .addCase(getFlightById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFlightById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFlight = action.payload;
      })
      .addCase(getFlightById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createFlight.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFlight.fulfilled, (state, action) => {
        state.loading = false;
        state.flights.push(action.payload);
      })
      .addCase(createFlight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateFlight.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFlight.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = state.flights.map((flight) =>
          flight._id === action.payload._id ? action.payload : flight
        );
        if (
          state.selectedFlight &&
          state.selectedFlight._id === action.payload._id
        ) {
          state.selectedFlight = action.payload;
        }
      })
      .addCase(updateFlight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteFlight.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFlight.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = state.flights.filter(
          (flight) => flight._id !== action.payload
        );
      })
      .addCase(deleteFlight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedFlight,
  resetFlightsState,
} = flightSlice.actions;

export default flightSlice.reducer;