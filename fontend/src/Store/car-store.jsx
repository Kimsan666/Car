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
  receiveActualCars,
} from "../api/InputCar";
import { listSaleCars } from "../api/SaleCar";
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
  salecars: [],
  carts: [],
  // ... existing functions ...
  // ✅ FIXED - actionAdtoCart function ที่ถูกต้อง 100%
  getInputCars: async (queryParams = {}) => {
    try {
      const { token } = get();
      const res = await listInputCars(token, queryParams);
      console.log("InputCars loaded:", res.data);

      // Handle different response structures
      const inputCarsData = res.data?.data || res.data || [];

      set({
        inputCars: inputCarsData,
      });
      return res.data;
    } catch (err) {
      console.error("Error loading InputCars:", err);
      toast.error(err.message || "ບໍ່ສາມາດໂຫຼດລາຍການນຳເຂົ້າໄດ້");
      throw err;
    }
  },

  getInputCar: async (id) => {
    try {
      const { token } = get();

      if (!id) {
        throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
      }

      const res = await readInputCar(token, id);
      console.log("InputCar loaded:", res.data);

      // Handle different response structures
      const inputCarData = res.data?.data || res.data;

      set({
        currentInputCar: inputCarData,
      });
      return res.data;
    } catch (err) {
      console.error("Error loading InputCar:", err);
      toast.error(err.message || "ບໍ່ສາມາດໂຫຼດລາຍການນຳເຂົ້າໄດ້");
      throw err;
    }
  },

  createInputCar: async (inputCarData) => {
    try {
      const { token } = get();

      // Validate required data
      if (!inputCarData.orderdById) {
        throw new Error("ກະລຸນາລະບຸຜູ້ສ້າງລາຍການນຳເຂົ້າ");
      }

      if (
        !inputCarData.products ||
        !Array.isArray(inputCarData.products) ||
        inputCarData.products.length === 0
      ) {
        throw new Error("ກະລຸນາເລືອກສິນຄ້າທີ່ຕ້ອງການນຳເຂົ້າ");
      }

      console.log("Creating InputCar with data:", inputCarData);

      const res = await saveInputCar(token, inputCarData);
      console.log("InputCar created:", res.data);

      // Refresh input cars list
      await get().getInputCars();

      toast.success("ສ້າງລາຍການນຳເຂົ້າສຳເລັດແລ້ວ");
      return res.data;
    } catch (err) {
      console.error("Error creating InputCar:", err);
      toast.error(err.message || "ບໍ່ສາມາດສ້າງລາຍການນຳເຂົ້າໄດ້");
      throw err;
    }
  },

  updateInputCar: async (id, inputCarData) => {
    try {
      const { token } = get();

      if (!id) {
        throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
      }

      console.log("Updating InputCar ID:", id, "with data:", inputCarData);

      const res = await updateInputCar(token, id, inputCarData);
      console.log("InputCar updated:", res.data);

      // Refresh input cars list
      await get().getInputCars();

      // Update current InputCar if it's the same one
      const currentInputCar = get().currentInputCar;
      if (currentInputCar && currentInputCar.id === parseInt(id)) {
        const updatedData = res.data?.data || res.data;
        set({ currentInputCar: updatedData });
      }

      toast.success("ອັບເດດລາຍການນຳເຂົ້າສຳເລັດແລ້ວ");
      return res.data;
    } catch (err) {
      console.error("Error updating InputCar:", err);
      toast.error(err.message || "ບໍ່ສາມາດອັບເດດລາຍການນຳເຂົ້າໄດ້");
      throw err;
    }
  },

  deleteInputCar: async (id) => {
    try {
      const { token } = get();

      if (!id) {
        throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
      }

      console.log("Deleting InputCar ID:", id);

      const res = await removeInputCar(token, id);
      console.log("InputCar deleted:", res.data);

      // Refresh input cars list
      await get().getInputCars();

      // Clear current InputCar if it's the same one
      const currentInputCar = get().currentInputCar;
      if (currentInputCar && currentInputCar.id === parseInt(id)) {
        set({ currentInputCar: null });
      }

      toast.success("ລົບລາຍການນຳເຂົ້າສຳເລັດແລ້ວ");
      return res.data;
    } catch (err) {
      console.error("Error deleting InputCar:", err);
      toast.error(err.message || "ບໍ່ສາມາດລົບລາຍການນຳເຂົ້າໄດ້");
      throw err;
    }
  },

  updateInputCarStatus: async (id, status) => {
    try {
      const { token } = get();

      if (!id) {
        throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
      }

      if (!status) {
        throw new Error("ກະລຸນາລະບຸສະຖານະ");
      }

      console.log("Updating InputCar status:", id, "to:", status);

      const res = await updateInputCarStatus(token, id, { status });
      console.log("InputCar status updated:", res.data);

      // Refresh input cars list
      await get().getInputCars();

      // Update current InputCar if it's the same one
      const currentInputCar = get().currentInputCar;
      if (currentInputCar && currentInputCar.id === parseInt(id)) {
        const updatedData = res.data?.data || res.data;
        set({ currentInputCar: updatedData });
      }

      toast.success(`ປ່ຽນສະຖານະເປັນ ${status} ສຳເລັດແລ້ວ`);
      return res.data;
    } catch (err) {
      console.error("Error updating InputCar status:", err);
      toast.error(err.message || "ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້");
      throw err;
    }
  },

  searchInputCars: async (searchData) => {
    try {
      const { token } = get();

      console.log("Searching InputCars with:", searchData);

      const res = await searchInputCars(token, searchData);
      console.log("Search results:", res.data);

      // Handle different response structures
      const inputCarsData = res.data?.data || res.data || [];

      set({
        inputCars: inputCarsData,
      });

      return res.data;
    } catch (err) {
      console.error("Error searching InputCars:", err);
      toast.error(err.message || "ບໍ່ສາມາດຄົ້ນຫາລາຍການນຳເຂົ້າໄດ້");
      throw err;
    }
  },

  receiveActualCars: async (inputCarId, receivedData) => {
    try {
      const { token } = get();

      if (!inputCarId) {
        throw new Error("ກະລຸນາລະບຸ ID ຂອງລາຍການນຳເຂົ້າ");
      }

      if (
        !receivedData ||
        !receivedData.receivedItems ||
        !Array.isArray(receivedData.receivedItems) ||
        receivedData.receivedItems.length === 0
      ) {
        throw new Error("ກະລຸນາປ້ອນຂໍ້ມູນລົດທີ່ໄດ້ຮັບຈິງ");
      }

      // Validate received items
      for (let item of receivedData.receivedItems) {
        if (!item.itemId) {
          throw new Error("ກະລຸນາລະບຸ itemId ສຳລັບແຕ່ລະລາຍການ");
        }

        if (!item.receivedQuantity || item.receivedQuantity <= 0) {
          throw new Error("ຈຳນວນທີ່ໄດ້ຮັບຕ້ອງມີຄ່າມາກກວ່າ 0");
        }

        if (
          !item.actualCars ||
          !Array.isArray(item.actualCars) ||
          item.actualCars.length !== item.receivedQuantity
        ) {
          throw new Error(
            `ຈຳນວນລາຍລະອຽດລົດຕ້ອງຕົງກັບຈຳນວນທີ່ໄດ້ຮັບ (${item.receivedQuantity} ຄັນ)`
          );
        }

        // Validate each car
        for (let car of item.actualCars) {
          if (
            !car.name ||
            !car.licensePlate ||
            !car.actualPrice ||
            !car.actualCostPrice
          ) {
            throw new Error(
              "ກະລຸນາປ້ອນຂໍ້ມູນລົດໃຫ້ຄົບຖ້ວນ (ຊື່, ປ້າຍທະບຽນ, ລາຄາ)"
            );
          }
        }
      }

      console.log("Receiving actual cars for InputCar ID:", inputCarId);
      console.log("Received data:", JSON.stringify(receivedData, null, 2));

      const res = await receiveActualCars(token, inputCarId, receivedData);
      console.log("Actual cars received:", res.data);

      // Refresh input cars list
      await get().getInputCars();

      // Update current InputCar
      const updatedInputCar = res.data?.data?.inputCar || res.data?.inputCar;
      if (updatedInputCar) {
        set({ currentInputCar: updatedInputCar });
      }

      // Show success message with summary
      const summary = res.data?.data?.summary || res.data?.summary;
      if (summary) {
        toast.success(
          `ບັນທຶກລົດຈິງສຳເລັດແລ້ວ (${summary.totalCarsReceived} ຄັນ)`
        );
      } else {
        toast.success("ບັນທຶກລົດຈິງສຳເລັດແລ້ວ");
      }

      return res.data;
    } catch (err) {
      console.error("Error receiving actual cars:", err);
      toast.error(err.message || "ບໍ່ສາມາດບັນທຶກລົດຈິງທີ່ໄດ້ຮັບໄດ້");
      throw err;
    }
  },

  // Helper functions for InputCar management
  getInputCarsByStatus: async (status) => {
    try {
      return await get().getInputCars({ status });
    } catch (err) {
      console.error("Error getting InputCars by status:", err);
      throw err;
    }
  },

  getInputCarsBySupplier: async (supplierId) => {
    try {
      return await get().getInputCars({ supplierId });
    } catch (err) {
      console.error("Error getting InputCars by supplier:", err);
      throw err;
    }
  },

  getInputCarsByUser: async (orderdById) => {
    try {
      return await get().getInputCars({ orderdById });
    } catch (err) {
      console.error("Error getting InputCars by user:", err);
      throw err;
    }
  },

  // Utility function สำหรับดึงใบสั่งซื้อที่อนุมัติแล้ว
  getConfirmedPurchasesForInput: async () => {
    try {
      const { token } = get();
      const res = await getConfirmedPurchases(token);
      console.log("Confirmed purchases loaded:", res.data);

      // Handle different response structures
      const purchasesData = res.data?.data || res.data || [];

      return {
        ...res,
        data: {
          ...res.data,
          data: purchasesData,
        },
      };
    } catch (err) {
      console.error("Error loading confirmed purchases:", err);
      toast.error(err.message || "ບໍ່ສາມາດໂຫຼດໃບສັ່ງຊື້ທີ່ອນຸມັດແລ້ວໄດ້");
      throw err;
    }
  },

  // ล้างข้อมูล currentInputCar
  clearCurrentInputCar: () => {
    set({
      currentInputCar: null,
    });
  },

  // Reset InputCars state
  resetInputCarsState: () => {
    set({
      inputCars: [],
      currentInputCar: null,
    });
  },

  // Get InputCar statistics
  getInputCarStats: () => {
    const { inputCars } = get();

    if (!Array.isArray(inputCars)) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        received: 0,
        cancelled: 0,
      };
    }

    return {
      total: inputCars.length,
      pending: inputCars.filter((ic) => ic.status === "PENDING").length,
      confirmed: inputCars.filter((ic) => ic.status === "CONFIRMED").length,
      received: inputCars.filter((ic) => ic.status === "RECEIVED").length,
      cancelled: inputCars.filter((ic) => ic.status === "CANCELLED").length,
    };
  },
  actionAdtoCart: async (item) => {
    try {
      

      const productId = item.product;
      const carts = get().carts || []; // ป้องกัน undefined

      // ✅ ตรวจสอบว่าสินค้ามีในกระเป๋าแล้วหรือยัง
      const isExist = carts.some((itemc) => {
        return itemc.id === productId.id;
      });

      if (isExist) {
        toast.info(
          <span className="font-notosanslao">ມີລົດນີ້ໃນກະຕ້າແລ້ວ</span>,
          {
            position: "top-right",
            autoClose: 2000,
          }
        );
        return false;
      }

      // ✅ เพิ่มสินค้าใหม่เข้ากระเป๋า
      const productWithInfo = {
        ...productId,
        cartItemId: `cart_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // สร้าง unique ID
        addedAt: new Date().toISOString(),
      };

      // ✅ สร้าง array ใหม่ (FIXED - ใช้ชื่อตัวแปรที่ถูกต้อง)
      const updatedCart = [...carts, productWithInfo];

      console.log("Updated cart:", updatedCart); // Debug log

      // ✅ อัพเดต state (FIXED - ใช้ updatedCart แทน uniqe)
      set({
        carts: updatedCart,
      });

      toast.success(
        <span className="font-notosanslao">
          ເພີ່ມລົດໃສ່ກະຕ້າແລ້ວ: {productId.name || "ລົດ"}
        </span>,
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(
        <span className="font-notosanslao">
          ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມລົດ: {err.message}
        </span>
      );
      return false;
    }
  },

  // ✅ เพิ่ม function ลบสินค้าออกจากกระเป๋า
  removeFromCart: (cartItemId) => {
    try {
      const carts = get().carts || [];
      const updatedCarts = carts.filter(
        (item) => item.cartItemId !== cartItemId
      );

      set({
        carts: updatedCarts,
      });

      toast.success(
        <span className="font-notosanslao">ລົບລົດອອກຈາກກະຕ້າແລ້ວ</span>,
        {
          position: "top-right",
          autoClose: 1500,
        }
      );

      return true;
    } catch (err) {
      console.error("Error removing from cart:", err);
      toast.error(
        <span className="font-notosanslao">ເກີດຂໍ້ຜິດພາດໃນການລົບລົດ</span>
      );
      return false;
    }
  },

  // ✅ เพิ่ม function ล้างกระเป๋า
  clearCart: () => {
    try {
      set({
        carts: [],
      });

      toast.success(
        <span className="font-notosanslao">ລຶບກະຕ້າທັງໝົດແລ້ວ</span>,
        {
          position: "top-right",
          autoClose: 1500,
        }
      );
    } catch (err) {
      console.error("Error clearing cart:", err);
      toast.error(
        <span className="font-notosanslao">ເກີດຂໍ້ຜິດພາດໃນການລຶບກະຕ້າ</span>
      );
    }
  },

  // ✅ เพิ่ม helper function สำหรับ cart
  getCartItemsCount: () => {
    const carts = get().carts || [];
    return carts.length;
  },

  getCartTotal: () => {
    const carts = get().carts || [];
    return carts.reduce(
      (total, item) => total + (parseFloat(item.price) || 0),
      0
    );
  },
  getSaleCars: async (queryParams = {}) => {
    try {
      const { token } = get();
      const res = await listSaleCars(token, queryParams);
      console.log("adwdsdw", res.data);
      set({
        salecars: res.data,
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
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
