import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ສ້າງອໍເດີໃໝ່
export const createOrder = async (token, orderData) => {
  return await axios.post(`${API_URL}/order`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການອໍເດີທັງໝົດ
export const listOrders = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}/orders?${queryString}` : `${API_URL}/orders`;
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍລະອຽດອໍເດີແຕ່ລະອັນ
export const getOrderById = async (token, id) => {
  return await axios.get(`${API_URL}/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດສະຖານະອໍເດີ
export const updateOrderStatus = async (token, id, status) => {
  return await axios.put(`${API_URL}/order/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສະຖິຕິການຂາຍ
export const getSalesStatistics = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}/sales/statistics?${queryString}` : `${API_URL}/sales/statistics`;
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບອໍເດີ
export const deleteOrder = async (token, id) => {
  return await axios.delete(`${API_URL}/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອ່ານລາຍລະອຽດອໍເດີ (alias สຳລັບຄວາມສະດວກ)
export const readOrder = async (token, id) => {
  return await getOrderById(token, id);
};

// ອັບເດດອໍເດີ (ຖ້າມີຄວາມຈຳເປັນໃນອະນາຄົດ)
export const updateOrder = async (token, id, orderData) => {
  return await axios.put(`${API_URL}/order/${id}`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ຍົກເລີກອໍເດີ
export const cancelOrder = async (token, id) => {
  return await updateOrderStatus(token, id, "Cancelled");
};

// ຢືນຢັນອໍເດີ
export const confirmOrder = async (token, id) => {
  return await updateOrderStatus(token, id, "Confirmed");
};