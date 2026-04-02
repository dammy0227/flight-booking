import API from "./apiService";

export const getRooms = async (params = {}) => {
  const res = await API.get("/rooms", { params });
  return res.data.rooms || [];
};


export const getRoomById = async (id) => {
  const res = await API.get(`/rooms/${id}`);
  return res.data.room;
};


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

export const getRoomsGrouped = async () => {
  const res = await API.get("/rooms/grouped");
  return res.data.groupedRooms || [];
};