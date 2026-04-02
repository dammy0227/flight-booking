import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as roomService from "../../services/room";

const initialState = {
  rooms: [],
  selectedRoom: null,
  stats: null,
  groupedRooms: [],
  loading: false,
  error: null
};

export const getRooms = createAsyncThunk(
  "rooms/getRooms",
  async (params = {}, thunkAPI) => {
    try {
      return await roomService.getRooms(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch rooms"
      );
    }
  }
);

export const getRoomById = createAsyncThunk(
  "rooms/getRoomById",
  async (id, thunkAPI) => {
    try {
      return await roomService.getRoomById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch room"
      );
    }
  }
);

export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (formData, thunkAPI) => {
    try {
      const res = await roomService.createRoom(formData);
      return res.data.room || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Room creation failed"
      );
    }
  }
);

export const updateRoom = createAsyncThunk(
  "rooms/updateRoom",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await roomService.updateRoom(id, formData);
      return res.data.room || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Room update failed"
      );
    }
  }
);

export const deleteRoom = createAsyncThunk(
  "rooms/deleteRoom",
  async (id, thunkAPI) => {
    try {
      await roomService.deleteRoom(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Room deletion failed"
      );
    }
  }
);

export const getRoomStats = createAsyncThunk(
  "rooms/getRoomStats",
  async (_, thunkAPI) => {
    try {
      const res = await roomService.getRoomStats();
      return res.data.stats || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

export const getRoomsGrouped = createAsyncThunk(
  "rooms/getRoomsGrouped",
  async (_, thunkAPI) => {
    try {
      return await roomService.getRoomsGrouped();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch grouped rooms"
      );
    }
  }
);

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRoom: (state) => {
      state.selectedRoom = null;
    },
    resetRoomsState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getRoomById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRoom = action.payload || null;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.unshift(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        state.rooms = state.rooms.map((room) =>
          room._id === updated._id ? updated : room
        );

        if (state.selectedRoom?._id === updated._id) {
          state.selectedRoom = updated;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter(
          (room) => room._id !== action.payload
        );
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getRoomStats.fulfilled, (state, action) => {
        state.stats = action.payload || {};
      })

      .addCase(getRoomsGrouped.fulfilled, (state, action) => {
        state.groupedRooms = Array.isArray(action.payload)
          ? action.payload
          : [];
      });
  }
});

export const {
  clearError,
  clearSelectedRoom,
  resetRoomsState
} = roomSlice.actions;

export default roomSlice.reducer;