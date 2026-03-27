import API from "./apiService";

export const getBookings = (params = {}) => API.get("/bookings", { params });

export const getBookingStats = () => API.get("/bookings/stats");

export const getBookingById = (id) => API.get(`/bookings/${id}`);

export const searchBookings = (params) => API.get("/bookings", { params });

export const updateBookingStatus = (id, data) => API.put(`/bookings/${id}/status`, data);

export const deleteBooking = (id) => API.delete(`/bookings/${id}`);