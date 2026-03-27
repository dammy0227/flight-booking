import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "../../services/user";

const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  token: token || null,
};

export const loginAdmin = createAsyncThunk(
  "users/loginAdmin",
  async (data, thunkAPI) => {
    try {
      const res = await userService.loginAdmin(data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logoutAdmin = createAsyncThunk("users/logoutAdmin", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
});

export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (_, thunkAPI) => {
    try {
      const res = await userService.getUsers();
      return res.data.users || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (id, thunkAPI) => {
    try {
      const res = await userService.getUserById(id);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await userService.updateUser(id, data);
      return res.data.user || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ id, role }, thunkAPI) => {
    try {
      const res = await userService.updateUser(id, { role });
      return res.data.user || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update user role");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, thunkAPI) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "users/updateProfile",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await userService.updateUser(id, formData);
      const updated = res.data.user || res.data;
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSelectedUser: (state) => { state.selectedUser = null; },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.users = [];
        state.selectedUser = null;
      })

      .addCase(getUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getUsers.fulfilled, (state, action) => { 
        state.loading = false; 
        state.users = Array.isArray(action.payload) ? action.payload : []; 
      })
      .addCase(getUsers.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
        state.users = []; 
      })

      .addCase(getUserById.pending, (state) => { state.loading = true; })
      .addCase(getUserById.fulfilled, (state, action) => { 
        state.loading = false; 
        state.selectedUser = action.payload; 
      })
      .addCase(getUserById.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload;
        state.users = state.users.map((u) =>
          u._id === updated._id ? updated : u
        );
        if (state.selectedUser?._id === updated._id) {
          state.selectedUser = updated;
        }
      })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updated = action.payload;
        state.users = state.users.map((u) =>
          u._id === updated._id ? updated : u
        );
        if (state.selectedUser?._id === updated._id) {
          state.selectedUser = updated;
        }
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      })

      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        );
      })
      .addCase(updateProfile.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      });
  },
});

export const { clearError, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;