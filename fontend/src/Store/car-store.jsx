import { create } from "zustand";
import axios from "axios";
import { persist, createJSONStorage } from "zustand/middleware";
import { login } from "../api/auth";
import _ from "lodash";
import { toast } from "react-toastify";
import { listCustomers } from "../api/Customer";
import { listBrands } from "../api/Brand";
import { listColors } from "../api/Color";
import { listTypes } from "../api/Type";
import { listBrandAndModels } from "../api/BrandAndModel";
import { listCars } from "../api/Car";
import { listSuppliers, listSuppliersEnabled } from "../api/Supplier";
import { listSuppliersProduct } from "../api/SupplierProduct";
import { 
  listInputCars, 
  readInputCar, 
  saveInputCar, 
  updateInputCar, 
  removeInputCar,
  updateInputCarStatus,
  searchInputCars,
  receiveActualCars 
} from "../api/InputCar";
const carStore = (set, get) => ({
  user: null,
  token: null,
  // categories: [],
  customers: [],
  brands: [],
  colors: [],
  types: [],
  brandAndModels: [], // เพิ่ม state สำหรับ brand and models
  cars: [], // เพิ่ม state สำหรับ cars
  suppliers: [],
  suppliersproducts: [],
  inputCars: [],
  currentInputCar: null,

  // ... existing functions ...

  // InputCar functions
  getInputCars: async (queryParams = {}) => {
    try {
      const { token } = get();
      const res = await listInputCars(token, queryParams);
      set({
        inputCars: res.data.data,
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getInputCar: async (id) => {
    try {
      const { token } = get();
      const res = await readInputCar(token, id);
      set({
        currentInputCar: res.data.data,
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createInputCar: async (inputCarData) => {
    try {
      const { token } = get();
      const res = await saveInputCar(token, inputCarData);

      // Refresh input cars list
      const inputCarsRes = await listInputCars(token);
      set({
        inputCars: inputCarsRes.data.data,
      });

      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateInputCar: async (id, inputCarData) => {
    try {
      const { token } = get();
      const res = await updateInputCar(token, id, inputCarData);

      // Refresh input cars list
      const inputCarsRes = await listInputCars(token);
      set({
        inputCars: inputCarsRes.data.data,
      });

      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteInputCar: async (id) => {
    try {
      const { token } = get();
      const res = await removeInputCar(token, id);

      // Refresh input cars list
      const inputCarsRes = await listInputCars(token);
      set({
        inputCars: inputCarsRes.data.data,
      });

      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateInputCarStatus: async (id, status) => {
    try {
      const { token } = get();
      const res = await updateInputCarStatus(token, id, { status });

      // Refresh input cars list
      const inputCarsRes = await listInputCars(token);
      set({
        inputCars: inputCarsRes.data.data,
      });

      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  searchInputCars: async (searchData) => {
    try {
      const { token } = get();
      const res = await searchInputCars(token, searchData);
      set({
        inputCars: res.data.data,
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  receiveActualCars: async (inputCarId, receivedData) => {
    try {
      const { token } = get();
      const res = await receiveActualCars(token, inputCarId, receivedData);

      // Refresh input cars list
      const inputCarsRes = await listInputCars(token);
      set({
        inputCars: inputCarsRes.data.data,
        currentInputCar: res.data.inputCar,
      });

      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  // Utility function สำหรับดึงใบสั่งซื้อที่อนุมัติแล้ว
  getConfirmedPurchasesForInput: async () => {
    try {
      const { token } = get();
      const res = await listPurchases(token, { status: "CONFIRMED" });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  // ล้างข้อมูล currentInputCar
  clearCurrentInputCar: () => {
    set({
      currentInputCar: null,
    });
  },
  // Car functions
  getSuppliersProduct: async () => {
    try {
      const { token } = get();
      const res = await listSuppliersProduct(token);
      console.log("ssssddddddddddwa", res.data);
      set({
        suppliersproducts: res.data.data,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getSupplier: async () => {
    try {
      const { token } = get();
      const res = await listSuppliers(token);
      set({
        suppliers: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  },

  getCar: async () => {
    try {
      const { token } = get();
      const res = await listCars(token);
      set({
        cars: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  },

  // Brand and Model functions
  getBrandAndModel: async () => {
    try {
      const res = await listBrandAndModels();
      set({
        brandAndModels: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  },

  getType: async () => {
    try {
      const res = await listTypes();
      set({
        types: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getColor: async () => {
    try {
      const res = await listColors();
      set({
        colors: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getBrand: async () => {
    try {
      const res = await listBrands();
      set({
        brands: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getCustomer: async () => {
    try {
      const { token } = get();
      const res = await listCustomers(token);
      set({
        customers: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  },

  actionLogout: () => {
    set({
      user: null,
      token: null,
      // carts: [],
      // products: [],
      // purchaseOrders: [],
      // currentPurchaseOrder: null,
      // currentWarehouseId: null,
    });
    localStorage.removeItem("car-storage");
  },
  actionLogin: async (form) => {
    const res = await login(form);
    set({
      user: res.data.payload,
      token: res.data.token,
    });
    return res;
  },
});

const usePersist = {
  name: "car-storage", // unique name
  storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
};

const useCarStore = create(persist(carStore, usePersist));

export default useCarStore;
