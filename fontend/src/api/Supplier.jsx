
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ດຶງລາຍການລູກຄ້າທັງໝົດ
export const listSuppliers = async (token) => {
  return await axios.get(`${API_URL}/suppliers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການລູກຄ້າທີ່ເປີດໃຊ້ງານເທົ່ານັ້ນ
export const listSuppliersEnabled = async (token) => {
  return await axios.get(`${API_URL}/suppliersenabled`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງຂໍ້ມູນລູກຄ້າແຕ່ລະຄົນ
export const readSupplier = async (token, id) => {
  return await axios.get(`${API_URL}/supplier/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງລູກຄ້າໃໝ່
export const saveSupplier = async (token, from) => {
  return await axios.post(`${API_URL}/supplier`, from, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດຂໍ້ມູນລູກຄ້າ
export const updateSupplier = async (token, id, form) => {
  return await axios.put(`${API_URL}/supplier/${id}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບລູກຄ້າ (soft delete)
export const removeSupplier = async (token, id) => {
  return await axios.delete(`${API_URL}/supplier/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

