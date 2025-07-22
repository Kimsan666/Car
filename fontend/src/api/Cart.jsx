import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// ເພີ່ມລົດເຂົ້າກະຕ່າ (ຈອງ)
export const addToCart = async (token, cartData) => {
  return await axios.post(`${API_URL}/cart`, cartData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການ Cart ທັງໝົດ
export const listCarts = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}/carts?${queryString}` : `${API_URL}/carts`;
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍລະອຽດ Cart ແຕ່ລະອັນ
export const getCartById = async (token, id) => {
  return await axios.get(`${API_URL}/cart/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ແປງ Cart ເປັນ Order (ຢືນຢັນການຂາຍ)
export const convertCartToOrder = async (token, cartId) => {
  return await axios.post(`${API_URL}/cart/${cartId}/convert-to-order`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ຍົກເລີກ Cart (ຄືນສະຖານະລົດເປັນ Available)
export const cancelCart = async (token, cartId) => {
  return await axios.delete(`${API_URL}/cart/${cartId}/cancel`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ແກ້ໄຂ Cart (ເພີ່ມ/ລົບ items)
export const updateCart = async (token, cartId, updateData) => {
  return await axios.put(`${API_URL}/cart/${cartId}/update`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອ່ານລາຍລະອຽດ Cart (alias สຳລັບຄວາມສະດວກ)
export const readCart = async (token, id) => {
  return await getCartById(token, id);
};

// ເພີ່ມລົດເຂົ້າ Cart ທີ່ມີຢູ່ແລ້ວ
export const addItemToCart = async (token, cartId, itemData) => {
  return await updateCart(token, cartId, {
    action: "add",
    ...itemData
  });
};

// ລົບລົດອອກຈາກ Cart
export const removeItemFromCart = async (token, cartId, saleCarId) => {
  return await updateCart(token, cartId, {
    action: "remove",
    saleCarId: saleCarId
  });
};

// ຢືນຢັນການຈອງ (alias สຳລັບ convertCartToOrder)
export const confirmReservation = async (token, cartId) => {
  return await convertCartToOrder(token, cartId);
};

// ຍົກເລີກການຈອງ (alias สຳลັບ cancelCart)
export const cancelReservation = async (token, cartId) => {
  return await cancelCart(token, cartId);
};

// ສ້າງການຈອງໃໝ່ (alias สຳລັບ addToCart)
export const createReservation = async (token, reservationData) => {
  return await addToCart(token, reservationData);
};

// ດຶງລາຍການການຈອງທັງໝົດ (alias สຳລັບ listCarts)
export const listReservations = async (token, params = {}) => {
  return await listCarts(token, params);
};

// ດຶງລາຍລະອຽດການຈອງ (alias สຳລັບ getCartById)
export const getReservationById = async (token, id) => {
  return await getCartById(token, id);
};

// ອັບເດດການຈອງ (alias สຳລັບ updateCart)
export const updateReservation = async (token, cartId, updateData) => {
  return await updateCart(token, cartId, updateData);
};