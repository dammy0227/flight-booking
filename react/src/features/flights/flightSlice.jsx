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
  async (_, thunkAPI) => {
    try {
      const res = await flightService.getFlights();
      return res.data.flights || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch flights"
      );
    }
  }
);

export const queryFlights = createAsyncThunk(
  "flights/queryFlights",
  async (params = {}, thunkAPI) => {
    try {
      return await flightService.queryFlights(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to query flights"
      );
    }
  }
);

export const searchFlights = createAsyncThunk(
  "flights/searchFlights",
  async (params, thunkAPI) => {
    try {
      const res = await flightService.searchFlights(params);
      return res.data.flights || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Search failed"
      );
    }
  }
);

export const getFlightsByDateRange = createAsyncThunk(
  "flights/getFlightsByDateRange",
  async ({ startDate, endDate }, thunkAPI) => {
    try {
      const res = await flightService.getFlightsByDateRange(startDate, endDate);
      return res.data.flights || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch by date range"
      );
    }
  }
);

export const getFlightStats = createAsyncThunk(
  "flights/getFlightStats",
  async (_, thunkAPI) => {
    try {
      const res = await flightService.getFlightStats();
      return res.data.stats || {};
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
      return await flightService.getFlightById(id);
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
      return res.data.flight || res.data;
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
      return res.data.flight || res.data;
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
        state.flights = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(queryFlights.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.flights = action.payload;
          state.groupedFlights = [];
        } else {
          state.groupedFlights = action.payload;
          state.flights = [];
        }
      })

      .addCase(searchFlights.fulfilled, (state, action) => {
        state.flights = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(getFlightsByDateRange.fulfilled, (state, action) => {
        state.flights = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(getFlightStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      .addCase(getFlightById.fulfilled, (state, action) => {
        state.selectedFlight = action.payload;
      })

      .addCase(createFlight.fulfilled, (state, action) => {
        state.flights.unshift(action.payload);
      })

      .addCase(updateFlight.fulfilled, (state, action) => {
        state.flights = state.flights.map((f) =>
          f._id === action.payload._id ? action.payload : f
        );

        if (state.selectedFlight?._id === action.payload._id) {
          state.selectedFlight = action.payload;
        }
      })

      .addCase(deleteFlight.fulfilled, (state, action) => {
        state.flights = state.flights.filter(
          (f) => f._id !== action.payload
        );
      });
  },
});

export const {
  clearError,
  clearSelectedFlight,
  resetFlightsState,
} = flightSlice.actions;

export default flightSlice.reducer;