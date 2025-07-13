
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ດຶງລາຍການລູກຄ້າທັງໝົດ
export const listColors = async (token) => {
  return await axios.get(`${API_URL}/colorcars`, {
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
export const readColor = async (token, id) => {
  return await axios.get(`${API_URL}/colorcar/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງລູກຄ້າໃໝ່
export const saveColor = async (token, from) => {
  return await axios.post(`${API_URL}/colorcar`, from, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດຂໍ້ມູນລູກຄ້າ
export const updateColor = async (token, id, from) => {
  return await axios.put(`${API_URL}/colorcar/${id}`, from, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບລູກຄ້າ (soft delete)
export const removeColor = async (token, id) => {
  return await axios.delete(`${API_URL}/colorcar/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

