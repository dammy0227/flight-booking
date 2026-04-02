import API from "./apiService";

export const createBooking = async (data) => {
  const res = await API.post("/bookings", data);
  return res.data.booking;
};

export const getBookings = async (params = {}) => {
  const res = await API.get("/bookings", { params });
  return res.data.bookings || [];
};

export const getBookingStats = () => API.get("/bookings/stats");
export const getBookingById = async (id) => {
  const res = await API.get(`/bookings/${id}`);
  return res.data.booking;
};

export const searchBookings = (params) => API.get("/bookings", { params });

export const updateBookingStatus = (id, data) => API.put(`/bookings/${id}/status`, data);

export const deleteBooking = (id) => API.delete(`/bookings/${id}`);