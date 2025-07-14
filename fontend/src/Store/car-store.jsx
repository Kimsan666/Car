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
  suppliersenabled: [],

  // Car functions
  getSuppliersEnabled: async () => {
    try {
      const { token } = get();
      const res = await listSuppliersEnabled(token);
      set({
        suppliersenabled: res.data,
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
      const res = await listCustomers();
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
