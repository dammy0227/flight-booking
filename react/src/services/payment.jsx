import API from "./apiService";

export const getPayments = (params) => API.get("/payments", { params });
export const getPaymentById = async (id) => {
  const res = await API.get(`/payments/${id}`);
  return res.data.payment;
};
export const updatePaymentStatus = (id, data) => API.put(`/payments/${id}/status`, data);
export const deletePayment = (id) => API.delete(`/payments/${id}`);
export const createPayment = async (data) => {
  const res = await API.post("/payments", data);
  return res.data.payment;
};