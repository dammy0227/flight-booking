import API from "./apiService";

export const getPayments = (params) => API.get("/payments", { params });
export const getPaymentById = (id) => API.get(`/payments/${id}`);
export const updatePaymentStatus = (id, data) => API.put(`/payments/${id}/status`, data);
export const deletePayment = (id) => API.delete(`/payments/${id}`);