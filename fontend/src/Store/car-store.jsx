import { create } from "zustand";
import axios from "axios";
import { persist, createJSONStorage } from "zustand/middleware";
import { login } from "../api/auth";
import _ from "lodash";
import { toast } from "react-toastify";
import { listCustomers } from "../api/Customer";
import { listBrands } from "../api/Brand";

const carStore = (set, get) => ({
  user: null,
  token: null,
  // categories: [],
  customers: [],

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
