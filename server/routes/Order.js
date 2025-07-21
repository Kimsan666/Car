const express = require("express");
const { authCheck, adminCheck } = require("../middleware/auth");
const { 
  createOrder, 
  listOrders, 
  getOrderById, 
  updateOrderStatus, 
  getSalesStatistics,
  deleteOrder 
} = require("../controllters/Order");

const router = express.Router();

// ສ້າງອໍເດີໃໝ່ (ພະນັກງານ + admin)
router.post("/order", authCheck, createOrder);

// ດຶງລາຍການອໍເດີທັງໝົດ (ພະນັກງານ + admin)
router.get("/orders", authCheck, listOrders);

// ດຶງລາຍລະອຽດອໍເດີແຕ່ລະອັນ (ພະນັກງານ + admin)
router.get("/order/:id", authCheck, getOrderById);

// ອັບເດດສະຖານະອໍເດີ (admin ເທົ່ານັ້ນ)
router.put("/order/:id/status", authCheck, adminCheck, updateOrderStatus);

// ສະຖິຕິການຂາຍ (ພະນັກງານ + admin)
router.get("/sales/statistics", authCheck, getSalesStatistics);

// ລົບອໍເດີ (admin ເທົ່ານັ້ນ)
router.delete("/order/:id", authCheck, adminCheck, deleteOrder);

module.exports = router;