
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ດຶງລາຍການລູກຄ້າທັງໝົດ
export const listBrands = async (token) => {
  return await axios.get(`${API_URL}/brands`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// // ດຶງລາຍການລູກຄ້າທີ່ເປີດໃຊ້ງານເທົ່ານັ້ນ
// export const listCustomersEnabled = async (token) => {
//   return await axios.get(`${API_URL}/customersenabled`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// ດຶງຂໍ້ມູນລູກຄ້າແຕ່ລະຄົນ
export const readBrand = async (token, id) => {
  return await axios.get(`${API_URL}/brand/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງລູກຄ້າໃໝ່
export const saveBrand = async (token, from) => {
  return await axios.post(`${API_URL}/brand`, from, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດຂໍ້ມູນລູກຄ້າ
export const updateBrand = async (token, id, from) => {
  return await axios.put(`${API_URL}/brand/${id}`, from, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບລູກຄ້າ (soft delete)
export const removeBrand = async (token, id) => {
  return await axios.delete(`${API_URL}/brand/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

