import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to handle API errors
const handleApiError = (error, defaultMessage) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(defaultMessage);
};

// ສ້າງລາຍການນຳເຂົ້າໃໝ່
export const saveInputCar = async (token, inputCarData) => {
  try {
    return await axios.post(`${API_URL}/input-car`, inputCarData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດສ້າງລາຍການນຳເຂົ້າໄດ້");
  }
};

// ບັນທຶກລົດຈິງທີ່ໄດ້ຮັບ
export const receiveActualCars = async (token, inputCarId, receivedData) => {
  try {
    return await axios.post(`${API_URL}/input-car/${inputCarId}/receive-cars`, receivedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດບັນທຶກລົດຈິງທີ່ໄດ້ຮັບໄດ້");
  }
};

// ດຶງລາຍການລາຍການນຳເຂົ້າທັງໝົດ (ສາມາດກັ່ນຕອງດ້ວຍ query parameters)
export const listInputCars = async (token, queryParams = {}) => {
  try {
    // Filter out empty values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== "" && value != null)
    );
    
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = queryString ? `${API_URL}/input-cars?${queryString}` : `${API_URL}/input-cars`;
   
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດດຶງລາຍການນຳເຂົ້າໄດ້");
  }
};

// ດຶງຂໍ້ມູນລາຍການນຳເຂົ້າແຕ່ລະລາຍການ
export const readInputCar = async (token, id) => {
  try {
    if (!id) {
      throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
    }
    
    return await axios.get(`${API_URL}/input-car/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍການນຳເຂົ້າໄດ້");
  }
};

// ອັບເດດລາຍການນຳເຂົ້າ
export const updateInputCar = async (token, id, inputCarData) => {
  try {
    if (!id) {
      throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
    }
    
    return await axios.put(`${API_URL}/input-car/${id}`, inputCarData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດອັບເດດລາຍການນຳເຂົ້າໄດ້");
  }
};

// ລົບລາຍການນຳເຂົ້າ
export const removeInputCar = async (token, id) => {
  try {
    if (!id) {
      throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
    }
    
    return await axios.delete(`${API_URL}/input-car/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດລົບລາຍການນຳເຂົ້າໄດ້");
  }
};

// ຄົ້ນຫາລາຍການນຳເຂົ້າ
export const searchInputCars = async (token, searchData) => {
  try {
    return await axios.post(`${API_URL}/input-cars/search`, searchData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດຄົ້ນຫາລາຍການນຳເຂົ້າໄດ້");
  }
};

// ປ່ຽນສະຖານະລາຍການນຳເຂົ້າ
export const updateInputCarStatus = async (token, id, statusData) => {
  try {
    if (!id) {
      throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
    }
    
    return await axios.patch(`${API_URL}/input-car/${id}/status`, statusData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດປ່ຽນສະຖານະລາຍການນຳເຂົ້າໄດ້");
  }
};

// ດຶງລາຍການລາຍການນຳເຂົ້າຕາມຜູ້ສະໜອງ
export const listInputCarsBySupplier = async (token, supplierId) => {
  try {
    if (!supplierId) {
      throw new Error("ກະລຸນາລະບຸ ID ຂອງຜູ້ສະໜອງ");
    }
    
    return await listInputCars(token, { supplierId });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດດຶງລາຍການນຳເຂົ້າຕາມຜູ້ສະໜອງໄດ້");
  }
};

// ດຶງລາຍການລາຍການນຳເຂົ້າຕາມສະຖານະ
export const listInputCarsByStatus = async (token, status) => {
  try {
    if (!status) {
      throw new Error("ກະລຸນາລະບຸສະຖານະ");
    }
    
    return await listInputCars(token, { status });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດດຶງລາຍການນຳເຂົ້າຕາມສະຖານະໄດ້");
  }
};

// ດຶງລາຍການລາຍການນຳເຂົ້າຂອງຜູ້ໃຊ້
export const listInputCarsByUser = async (token, orderdById) => {
  try {
    if (!orderdById) {
      throw new Error("ກະລຸນາລະບຸ ID ຂອງຜູ້ໃຊ້");
    }
    
    return await listInputCars(token, { orderdById });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດດຶງລາຍການນຳເຂົ້າຂອງຜູ້ໃຊ້ໄດ້");
  }
};

// ດຶງລາຍການໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວ (ສຳລັບການສ້າງລາຍການນຳເຂົ້າ)
export const getConfirmedPurchases = async (token) => {
  try {
    return await axios.get(`${API_URL}/purchases?status=CONFIRMED`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດດຶງລາຍການໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວໄດ້");
  }
};

// ສ້າງລາຍການນຳເຂົ້າຈາກໃບສັ່ງຊື້ຫຼາຍໃບ
export const createInputCarFromPurchases = async (token, purchaseIds, inputCarData) => {
  try {
    if (!purchaseIds || !Array.isArray(purchaseIds) || purchaseIds.length === 0) {
      throw new Error("ກະລຸນາເລືອກໃບສັ່ງຊື້ຢ່າງນ້ອຍ 1 ໃບ");
    }
    
    return await axios.post(`${API_URL}/input-car/from-purchases`, {
      purchaseIds,
      ...inputCarData
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    handleApiError(error, "ບໍ່ສາມາດສ້າງລາຍການນຳເຂົ້າຈາກໃບສັ່ງຊື້ໄດ້");
  }
};

// Export default object with all functions
export default {
  saveInputCar,
  receiveActualCars,
  listInputCars,
  readInputCar,
  updateInputCar,
  removeInputCar,
  searchInputCars,
  updateInputCarStatus,
  listInputCarsBySupplier,
  listInputCarsByStatus,
  listInputCarsByUser,
  getConfirmedPurchases,
  createInputCarFromPurchases,
};