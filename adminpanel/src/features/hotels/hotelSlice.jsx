import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as hotelService from "../../services/hotel";

const initialState = {
  hotels: [],
  groupedHotels: [],
  selectedHotel: null,
  stats: {
    totalHotels: 0,
    avgRating: 0,
    totalCities: 0,
    highRated: 0,
    newThisWeek: 0,
  },
  loading: false,
  error: null,
};

export const getHotels = createAsyncThunk(
  "hotels/getHotels",
  async (params = {}, thunkAPI) => {
    try {
      const res = await hotelService.queryHotels(params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotels"
      );
    }
  }
);

export const getHotelStats = createAsyncThunk(
  "hotels/getHotelStats",
  async (_, thunkAPI) => {
    try {
      const res = await hotelService.getHotelStats();
      return res.data.stats;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

export const getHotelById = createAsyncThunk(
  "hotels/getHotelById",
  async (id, thunkAPI) => {
    try {
      const res = await hotelService.getHotelById(id);
      return res.data.hotel || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotel"
      );
    }
  }
);

export const createHotel = createAsyncThunk(
  "hotels/createHotel",
  async (formData, thunkAPI) => {
    try {
      const res = await hotelService.createHotel(formData);
      return res.data.hotel;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Hotel creation failed"
      );
    }
  }
);

export const updateHotel = createAsyncThunk(
  "hotels/updateHotel",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await hotelService.updateHotel(id, formData);
      return res.data.hotel;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Hotel update failed"
      );
    }
  }
);

export const deleteHotel = createAsyncThunk(
  "hotels/deleteHotel",
  async (id, thunkAPI) => {
    try {
      await hotelService.deleteHotel(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Hotel deletion failed"
      );
    }
  }
);

const hotelSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSelectedHotel: (state) => { state.selectedHotel = null; },
    resetHotelsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHotels.fulfilled, (state, action) => {
        state.loading = false;
        const list = action.payload?.hotels;

        if (!Array.isArray(list) || list.length === 0) {
          state.hotels = [];
          state.groupedHotels = [];
          return;
        }

        const firstItem = list[0];
        const isGrouped = firstItem != null &&
          typeof firstItem.city === "string" &&
          Array.isArray(firstItem.hotels);

        if (isGrouped) {
          state.groupedHotels = list;
          state.hotels = [];
        } else {
          state.hotels = list;
          state.groupedHotels = [];
        }
      })
      .addCase(getHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getHotelStats.fulfilled, (state, action) => {
        if (action.payload) state.stats = action.payload;
      })

      .addCase(getHotelById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getHotelById.fulfilled, (state, action) => { state.loading = false; state.selectedHotel = action.payload; })
      .addCase(getHotelById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createHotel.fulfilled, (state, action) => {
        if (action.payload) state.hotels.unshift(action.payload);
      })

      .addCase(updateHotel.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;

        state.hotels = state.hotels.map((h) =>
          h._id === updated._id ? updated : h
        );

        state.groupedHotels = state.groupedHotels.map((group) => ({
          ...group,
          hotels: (group.hotels || []).map((h) =>
            h._id === updated._id ? updated : h
          ),
        }));

        if (state.selectedHotel?._id === updated._id) {
          state.selectedHotel = updated;
        }
      })

      .addCase(deleteHotel.fulfilled, (state, action) => {
        const id = action.payload;

        state.hotels = state.hotels.filter((h) => h._id !== id);

        state.groupedHotels = state.groupedHotels
          .map((group) => ({
            ...group,
            hotels: (group.hotels || []).filter((h) => h._id !== id),
            count: Math.max(0, (group.count || 1) - 1),
          }))
          .filter((group) => (group.hotels || []).length > 0);
      });
  },
});

export const { clearError, clearSelectedHotel, resetHotelsState } = hotelSlice.actions;
export default hotelSlice.reducer;