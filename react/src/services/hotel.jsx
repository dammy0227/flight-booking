import API from "./apiService";

export const queryHotels = async (params = {}) => {
  const res = await API.get("/hotels/query", { params });
  return res.data.hotels || res.data || [];
};


export const getHotelStats = async () => {
  const res = await API.get("/hotels/stats");
  return res.data.stats || {};
};

export const getHotels = () =>
  API.get("/hotels");

export const getHotelById = async (id) => {
  const res = await API.get(`/hotels/${id}`);
  return res.data.hotel || res.data;
};


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