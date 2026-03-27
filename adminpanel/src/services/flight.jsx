import API from "./apiService";

export const getFlights = () =>
  API.get("/flights");

export const getFlightById = (id) =>
  API.get(`/flights/${id}`);

export const createFlight = (data) =>
  API.post("/flights", data);

export const updateFlight = (id, data) =>
  API.put(`/flights/${id}`, data);

export const deleteFlight = (id) =>
  API.delete(`/flights/${id}`);

export const queryFlights = (params) =>
  API.get("/flights", { params });  

export const getFlightStats = () =>
  API.get("/flights/stats");

export const getFlightsByDateRange = (startDate, endDate) =>
  API.get("/flights/range", {
    params: { startDate, endDate },
  });

export const searchFlights = (params) =>
  API.get("/flights/search", { params });