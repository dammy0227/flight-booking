import API from "./apiService";

export const getFlights = () =>
  API.get("/flights");

export const getFlightById = async (id) => {
  const res = await API.get(`/flights/${id}`);
  return res.data.flight || res.data;
};

export const createFlight = (data) =>
  API.post("/flights", data);

export const updateFlight = (id, data) =>
  API.put(`/flights/${id}`, data);

export const deleteFlight = (id) =>
  API.delete(`/flights/${id}`);


export const queryFlights = async (params = {}) => {
  const res = await API.get("/flights", { params });
  return res.data.flights || [];
};

export const getFlightStats = () =>
  API.get("/flights/stats");

export const getFlightsByDateRange = (startDate, endDate) =>
  API.get("/flights/range", {
    params: { startDate, endDate },
  });

export const searchFlights = (params) =>
  API.get("/flights/search", { params });