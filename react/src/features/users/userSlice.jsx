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

// =========================
// 🔐 LOGIN (USER + ADMIN)
// =========================
export const loginUser = createAsyncThunk(
  "users/loginUser",
  async (data, thunkAPI) => {
    try {
      const res = await userService.loginUser(data);

      // ✅ Save properly
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      return res; // { user, token }
    } catch (error) {
      return thunkAPI.rejectWithValue(userService.handleError(error));
    }
  }
);

// =========================
// 📝 REGISTER
// =========================
export const registerUser = createAsyncThunk(
  "users/registerUser",
  async (data, thunkAPI) => {
    try {
      const res = await userService.registerUser(data);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(userService.handleError(error));
    }
  }
);

// =========================
// 🔥 FIREBASE LOGIN
// =========================


export const firebaseLogin = createAsyncThunk(
  "users/firebaseLogin",
  async (firebaseUser, thunkAPI) => {
    try {
      const res = await userService.firebaseLogin({
        idToken: firebaseUser.token,
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(userService.handleError(error));
    }
  }
);

// =========================
// 🚪 LOGOUT
// =========================
export const logoutUser = createAsyncThunk("users/logoutUser", async () => {
  userService.logoutUser();
  localStorage.removeItem("user");
  localStorage.removeItem("token");
});

// =========================
// 👥 USERS CRUD
// =========================
export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (_, thunkAPI) => {
    try {
      return await userService.getUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue(userService.handleError(error));
    }
  }
);

export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (id, thunkAPI) => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(userService.handleError(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, thunkAPI) => {
    try {
      return await userService.updateUser(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(userService.handleError(error));
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
      return thunkAPI.rejectWithValue(userService.handleError(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  "users/updateProfile",
  async ({ id, formData }, thunkAPI) => {
    try {
      const updated = await userService.updateUser(id, formData);
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(userService.handleError(error));
    }
  }
);

// =========================
// 🧠 SLICE
// =========================
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REGISTER
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      // FIREBASE
      .addCase(firebaseLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.users = [];
        state.selectedUser = null;
      })

      // USERS
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload || [];
      })

      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload;
        state.users = state.users.map((u) =>
          u._id === updated._id ? updated : u
        );
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;