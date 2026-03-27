import API from "./apiService";

export const queryHotels = (params = {}) =>
  API.get("/hotels/query", { params });

export const getHotelStats = () =>
  API.get("/hotels/stats");

export const getHotels = () =>
  API.get("/hotels");

export const getHotelById = (id) =>
  API.get(`/hotels/${id}`);

export const createHotel = (formData) =>
  API.post("/hotels", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateHotel = (id, formData) =>
  API.put(`/hotels/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteHotel = (id) =>
  API.delete(`/hotels/${id}`);

export const getHotelsGroupedByCity = () =>
  API.get("/hotels/query", { params: { groupBy: "city" } });

export const searchHotels = (params) =>
  API.get("/hotels/search", { params });