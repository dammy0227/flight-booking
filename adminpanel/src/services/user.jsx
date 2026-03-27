import API from "./apiService";

export const loginAdmin = (data) => API.post("/users/login", data);

export const getUsers = () => API.get("/users");

export const getUserById = (id) => API.get(`/users/${id}`);

export const updateUser = (id, formData) =>
  API.put(`/users/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });