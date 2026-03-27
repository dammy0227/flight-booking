import API from "./apiService";

export const getRooms = (params) => API.get("/rooms", { params });

export const getRoomById = (id) => API.get(`/rooms/${id}`);

export const createRoom = (formData) => 
  API.post("/rooms", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRoom = (id, formData) => 
  API.put(`/rooms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

export const getRoomStats = () => API.get("/rooms/stats");

export const getRoomsGrouped = () => API.get("/rooms/grouped");