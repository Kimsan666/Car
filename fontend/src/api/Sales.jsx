import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ດຶງລາຍການລູກຄ້າທີ່ເປີດໃຊ້ງານ
export const listCustomersEnabled = async (token) => {
  return await axios.get(`${API_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງລູກຄ້າໃໝ່
export const createCustomer = async (token, customerData) => {
  return await axios.post(`${API_URL}/customer`, customerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລົດທີ່ສາມາດຂາຍໄດ້ (Available)
export const listAvailableCars = async (token) => {
  return await axios.get(`${API_URL}/sales/cars/available`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງຄຳສັ່ງຂາຍ
export const createSalesOrder = async (token, orderData) => {
  return await axios.post(`${API_URL}/sales/order`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການການຂາຍທັງໝົດ
export const listSalesOrders = async (token) => {
  return await axios.get(`${API_URL}/sales/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງການຂາຍແຕ່ລະລາຍການ
export const getSalesOrderById = async (token, id) => {
  return await axios.get(`${API_URL}/sales/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ຍົກເລີກການຂາຍ
export const cancelSalesOrder = async (token, id) => {
  return await axios.delete(`${API_URL}/sales/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບໂຫຼດຮູບພາບເອກະສານລູກຄ້າ
export const uploadCustomerDocument = async (token, imageData) => {
  return await axios.post(`${API_URL}/sales/upload-document`, { image: imageData }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລຶບຮູບພາບ
export const removeImage = async (token, publicId) => {
  return await axios.post(`${API_URL}/sales/remove-image`, { public_id: publicId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};