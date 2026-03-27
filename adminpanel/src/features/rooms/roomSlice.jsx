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
  async (params, thunkAPI) => {
    try {
      const res = await roomService.getRooms(params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch rooms");
    }
  }
);

export const getRoomById = createAsyncThunk(
  "rooms/getRoomById",
  async (id, thunkAPI) => {
    try {
      const res = await roomService.getRoomById(id);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch room");
    }
  }
);

export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (data, thunkAPI) => {
    try {
      const res = await roomService.createRoom(data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Room creation failed");
    }
  }
);

export const updateRoom = createAsyncThunk(
  "rooms/updateRoom",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await roomService.updateRoom(id, data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Room update failed");
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
      return thunkAPI.rejectWithValue(error.response?.data || "Room deletion failed");
    }
  }
);

export const searchRooms = createAsyncThunk(
  "rooms/searchRooms",
  async (params, thunkAPI) => {
    try {
      const res = await roomService.searchRooms(params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Room search failed");
    }
  }
);

export const getRoomStats = createAsyncThunk(
  "rooms/getRoomStats",
  async (_, thunkAPI) => {
    try {
      const res = await roomService.getRoomStats();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch stats");
    }
  }
);

export const getRoomsGrouped = createAsyncThunk(
  "rooms/getRoomsGrouped",
  async (_, thunkAPI) => {
    try {
      const res = await roomService.getRoomsGrouped();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch grouped rooms");
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
        state.rooms = action.payload.rooms || [];
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
        state.selectedRoom = action.payload.room || null;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.room) {
          state.rooms.push(action.payload.room);
        }
      })

      .addCase(updateRoom.fulfilled, (state, action) => {
        const updatedRoom = action.payload.room;
        state.rooms = state.rooms.map((room) =>
          room._id === updatedRoom._id ? updatedRoom : room
        );
        if (state.selectedRoom && state.selectedRoom._id === updatedRoom._id) {
          state.selectedRoom = updatedRoom;
        }
      })

      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(room => room._id !== action.payload);
      })

      .addCase(searchRooms.fulfilled, (state, action) => {
        state.rooms = action.payload.rooms || [];
      })

      .addCase(getRoomStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })

      .addCase(getRoomsGrouped.fulfilled, (state, action) => {
        state.groupedRooms = action.payload.groupedRooms || [];
      });
  }
});

export const { clearError, clearSelectedRoom, resetRoomsState } = roomSlice.actions;

export default roomSlice.reducer;