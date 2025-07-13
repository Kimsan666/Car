
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ດຶງລາຍການລູກຄ້າທັງໝົດ
export const listCustomers = async (token) => {
  return await axios.get(`${API_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການລູກຄ້າທີ່ເປີດໃຊ້ງານເທົ່ານັ້ນ
export const listCustomersEnabled = async (token) => {
  return await axios.get(`${API_URL}/customersenabled`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງຂໍ້ມູນລູກຄ້າແຕ່ລະຄົນ
export const readCustomer = async (token, id) => {
  return await axios.get(`${API_URL}/customer/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງລູກຄ້າໃໝ່
export const saveCustomer = async (token, customerData) => {
  return await axios.post(`${API_URL}/customer`, customerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດຂໍ້ມູນລູກຄ້າ
export const updateCustomer = async (token, id, customerData) => {
  return await axios.put(`${API_URL}/customer/${id}`, customerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບລູກຄ້າ (soft delete)
export const removeCustomer = async (token, id) => {
  return await axios.delete(`${API_URL}/customer/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບໂຫລດຮູບພາບ
export const uploadCustomerImage = async (token, imageData) => {
  return await axios.post(`${API_URL}/imaged`, imageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບຮູບພາບ
export const removeCustomerImage = async (token, imageData) => {
  return await axios.post(`${API_URL}/removeimage`, imageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};