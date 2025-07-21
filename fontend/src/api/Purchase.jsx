import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ສ້າງໃບສັ່ງຊື້ໃໝ່
export const savePurchases = async (token, purchaseData) => {
  return await axios.post(`${API_URL}/purchase`, purchaseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການໃບສັ່ງຊື້ທັງໝົດ (ສາມາດກັ່ນຕອງດ້ວຍ query parameters)
// ຕົວຢ່າງ: listPurchases(token, { status: 'PENDING', supplierId: 1 })
export const listPurchases = async (token, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = queryString ? `${API_URL}/purchases?${queryString}` : `${API_URL}/purchases`;
  
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງຂໍ້ມູນໃບສັ່ງຊື້ແຕ່ລະໃບ
export const readPurchase = async (token, id) => {
  return await axios.get(`${API_URL}/purchase/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດໃບສັ່ງຊື້
export const updatePurchase = async (token, id, purchaseData) => {
  return await axios.put(`${API_URL}/purchase/${id}`, purchaseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບໃບສັ່ງຊື້
export const removePurchase = async (token, id) => {
  return await axios.delete(`${API_URL}/purchase/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ຄົ້ນຫາໃບສັ່ງຊື້
export const searchPurchases = async (token, searchData) => {
  return await axios.post(`${API_URL}/purchases/search`, searchData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ປ່ຽນສະຖານະໃບສັ່ງຊື້
export const updatePurchaseStatus = async (token, id, statusData) => {
  return await axios.patch(`${API_URL}/purchase/${id}/status`, statusData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການໃບສັ່ງຊື້ຕາມຜູ້ສະໜອງ
export const listPurchasesBySupplier = async (token, supplierId) => {
  return await axios.get(`${API_URL}/purchases?supplierId=${supplierId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການໃບສັ່ງຊື້ຕາມສະຖານະ
export const listPurchasesByStatus = async (token, status) => {
  return await axios.get(`${API_URL}/purchases?status=${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການໃບສັ່ງຊື້ຂອງຜູ້ໃຊ້
export const listPurchasesByUser = async (token, orderdById) => {
  return await axios.get(`${API_URL}/purchases?orderdById=${orderdById}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};