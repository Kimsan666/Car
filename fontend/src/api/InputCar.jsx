import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ສ້າງລາຍການນຳເຂົ້າໃໝ່
export const saveInputCar = async (token, inputCarData) => {
  return await axios.post(`${API_URL}/input-car`, inputCarData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ບັນທຶກລົດຈິງທີ່ໄດ້ຮັບ
export const receiveActualCars = async (token, inputCarId, receivedData) => {
  return await axios.post(`${API_URL}/input-car/${inputCarId}/receive-cars`, receivedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການລາຍການນຳເຂົ້າທັງໝົດ (ສາມາດກັ່ນຕອງດ້ວຍ query parameters)
// ຕົວຢ່າງ: listInputCars(token, { status: 'PENDING', supplierId: 1 })
export const listInputCars = async (token, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = queryString ? `${API_URL}/input-cars?${queryString}` : `${API_URL}/input-cars`;
 
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງຂໍ້ມູນລາຍການນຳເຂົ້າແຕ່ລະລາຍການ
export const readInputCar = async (token, id) => {
  return await axios.get(`${API_URL}/input-car/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ອັບເດດລາຍການນຳເຂົ້າ
export const updateInputCar = async (token, id, inputCarData) => {
  return await axios.put(`${API_URL}/input-car/${id}`, inputCarData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ລົບລາຍການນຳເຂົ້າ
export const removeInputCar = async (token, id) => {
  return await axios.delete(`${API_URL}/input-car/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ຄົ້ນຫາລາຍການນຳເຂົ້າ
export const searchInputCars = async (token, searchData) => {
  return await axios.post(`${API_URL}/input-cars/search`, searchData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ປ່ຽນສະຖານະລາຍການນຳເຂົ້າ
export const updateInputCarStatus = async (token, id, statusData) => {
  return await axios.patch(`${API_URL}/input-car/${id}/status`, statusData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການລາຍການນຳເຂົ້າຕາມຜູ້ສະໜອງ
export const listInputCarsBySupplier = async (token, supplierId) => {
  return await axios.get(`${API_URL}/input-cars?supplierId=${supplierId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການລາຍການນຳເຂົ້າຕາມສະຖານະ
export const listInputCarsByStatus = async (token, status) => {
  return await axios.get(`${API_URL}/input-cars?status=${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການລາຍການນຳເຂົ້າຂອງຜູ້ໃຊ້
export const listInputCarsByUser = async (token, orderdById) => {
  return await axios.get(`${API_URL}/input-cars?orderdById=${orderdById}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ດຶງລາຍການໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວ (ສຳລັບການສ້າງລາຍການນຳເຂົ້າ)
export const getConfirmedPurchases = async (token) => {
  return await axios.get(`${API_URL}/purchases?status=CONFIRMED`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ສ້າງລາຍການນຳເຂົ້າຈາກໃບສັ່ງຊື້ຫຼາຍໃບ
export const createInputCarFromPurchases = async (token, purchaseIds, inputCarData) => {
  return await axios.post(`${API_URL}/input-car/from-purchases`, {
    purchaseIds,
    ...inputCarData
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};