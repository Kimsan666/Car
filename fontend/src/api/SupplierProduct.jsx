import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ດຶງລາຍການການເຊື່ອມຕໍ່ທັງໝົດ
export const listSuppliersProduct = async (token, query = {}) => {
  const queryString = new URLSearchParams(query).toString();
  const url = queryString ? `${API_URL}/supplier-products?${queryString}` : `${API_URL}/supplier-products`;
  
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງຂໍ້ມູນການເຊື່ອມຕໍ່ແຕ່ລະລາຍການ
export const readSupplierProduct = async (token, id) => {
  return await axios.get(`${API_URL}/supplier-product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງການເຊື່ອມຕໍ່ໃໝ່
export const saveSupplierProduct = async (token, data) => {
  return await axios.post(`${API_URL}/supplier-product`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດການເຊື່ອມຕໍ່
export const updateSupplierProduct = async (token, id, data) => {
  return await axios.put(`${API_URL}/supplier-product/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບການເຊື່ອມຕໍ່
export const removeSupplierProduct = async (token, id) => {
  return await axios.delete(`${API_URL}/supplier-product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ເປີດ/ປິດການເຊື່ອມຕໍ່
export const toggleSupplierProduct = async (token, id) => {
  return await axios.patch(`${API_URL}/supplier-product/${id}/toggle`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};