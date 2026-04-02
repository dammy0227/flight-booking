import API from "./apiService";

export const registerUser = async (data) => {
  const res = await API.post("/users/register", data);

  const { user, token } = res.data;

  if (token) {
    localStorage.setItem("token", token);
  }

  return { user, token };
};

export const loginUser = async (data) => {
  const res = await API.post("/users/login", data);

  const { user, token } = res.data;

  if (token) {
    localStorage.setItem("token", token);
  }

  return { user, token };
};

export const firebaseLogin = async (data) => {
  const res = await API.post("/users/firebase", data);

  const { user, token } = res.data;

  if (token) {
    localStorage.setItem("token", token);
  }

  return { user, token };
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};


export const getUsers = async () => {
  const res = await API.get("/users");
  return res.data.users || [];
};

export const getUserById = async (id) => {
  const res = await API.get(`/users/${id}`);
  return res.data;
};


export const updateUser = async (id, formData) => {
  const res = await API.put(`/users/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.user || res.data;
};


export const deleteUser = async (id) => {
  const res = await API.delete(`/users/${id}`);
  return res.data;
};

export const loginAdmin = loginUser;


export const handleError = (error) => {
  if (error.response) {
    return error.response.data?.message || "Server error";
  }
  return error.message || "Network error";
};