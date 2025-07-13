
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ດຶງລາຍການລູກຄ້າທັງໝົດ
export const listTypes = async (token) => {
  return await axios.get(`${API_URL}/typecars`, {
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
export const readType = async (token, id) => {
  return await axios.get(`${API_URL}/typecar/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງລູກຄ້າໃໝ່
export const saveType = async (token, from) => {
  return await axios.post(`${API_URL}/typecar`, from, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດຂໍ້ມູນລູກຄ້າ
export const updateType = async (token, id, from) => {
  return await axios.put(`${API_URL}/typecar/${id}`, from, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບລູກຄ້າ (soft delete)
export const removeType = async (token, id) => {
  return await axios.delete(`${API_URL}/typecar/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

