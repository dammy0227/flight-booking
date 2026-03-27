import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as paymentService from "../../services/payment";

const initialState = {
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
};


export const getPayments = createAsyncThunk(
  "payments/getPayments",
  async (params, thunkAPI) => {
    try {
      const res = await paymentService.getPayments(params);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch payments"
      );
    }
  }
);

export const getPaymentById = createAsyncThunk(
  "payments/getPaymentById",
  async (id, thunkAPI) => {
    try {
      const res = await paymentService.getPaymentById(id);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch payment"
      );
    }
  }
);


export const updatePaymentStatus = createAsyncThunk(
  "payments/updatePaymentStatus",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await paymentService.updatePaymentStatus(id, data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Payment update failed"
      );
    }
  }
);


export const deletePayment = createAsyncThunk(
  "payments/deletePayment",
  async (id, thunkAPI) => {
    try {
      await paymentService.deletePayment(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Payment deletion failed"
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
    resetPaymentsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      .addCase(getPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments; 
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(getPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPayment = action.payload.payment; 
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.payment; 

        state.payments = state.payments.map((p) =>
          p._id === updated._id ? updated : p
        );

        if (state.selectedPayment?._id === updated._id) {
          state.selectedPayment = updated;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.filter(
          (p) => p._id !== action.payload
        );
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedPayment,
  resetPaymentsState,
} = paymentSlice.actions;

export default paymentSlice.reducer;