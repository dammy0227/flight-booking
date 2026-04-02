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
  async (_, thunkAPI) => {
    try {
      const res = await hotelService.getHotels();
      return res.data.hotels || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotels"
      );
    }
  }
);

export const queryHotels = createAsyncThunk(
  "hotels/queryHotels",
  async (params = {}, thunkAPI) => {
    try {
      return await hotelService.queryHotels(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Query failed"
      );
    }
  }
);

export const searchHotels = createAsyncThunk(
  "hotels/searchHotels",
  async (params, thunkAPI) => {
    try {
      const res = await hotelService.searchHotels(params);
      return res.data.hotels || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Search failed"
      );
    }
  }
);

export const getHotelsGroupedByCity = createAsyncThunk(
  "hotels/getHotelsGroupedByCity",
  async (_, thunkAPI) => {
    try {
      const res = await hotelService.getHotelsGroupedByCity();
      return res.data.hotels || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Grouping failed"
      );
    }
  }
);

export const getHotelStats = createAsyncThunk(
  "hotels/getHotelStats",
  async (_, thunkAPI) => {
    try {
      return await hotelService.getHotelStats();
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
      return await hotelService.getHotelById(id);
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
      return res.data.hotel || res.data;
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
      return res.data.hotel || res.data;
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
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedHotel: (state) => {
      state.selectedHotel = null;
    },
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
        state.hotels = Array.isArray(action.payload) ? action.payload : [];
        state.groupedHotels = [];
      })
      .addCase(getHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(queryHotels.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.hotels = action.payload;
          state.groupedHotels = [];
        } else {
          state.groupedHotels = action.payload;
          state.hotels = [];
        }
      })

      .addCase(searchHotels.fulfilled, (state, action) => {
        state.hotels = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(getHotelsGroupedByCity.fulfilled, (state, action) => {
        state.groupedHotels = Array.isArray(action.payload)
          ? action.payload
          : [];
        state.hotels = [];
      })

      .addCase(getHotelStats.fulfilled, (state, action) => {
        state.stats = action.payload || {};
      })

      .addCase(getHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHotel = action.payload;
      })
      .addCase(getHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createHotel.fulfilled, (state, action) => {
        state.hotels.unshift(action.payload);
      })

      .addCase(updateHotel.fulfilled, (state, action) => {
        const updated = action.payload;

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
          }))
          .filter((group) => (group.hotels || []).length > 0);

        if (state.selectedHotel?._id === id) {
          state.selectedHotel = null;
        }
      });
  },
});

export const {
  clearError,
  clearSelectedHotel,
  resetHotelsState,
} = hotelSlice.actions;

export default hotelSlice.reducer;