const express = require("express");
const { authCheck, adminCheck } = require("../middleware/auth");
const {
  addToCart,
  listCarts,
  getCartById,
  convertCartToOrder,
  cancelCart,
  updateCart
} = require("../controllters/Cart");

const router = express.Router();

// ເພີ່ມລົດເຂົ້າກະຕ່າ (ຈອງ) - ພະນັກງານ + admin
router.post("/cart", authCheck, addToCart);

// ດຶງລາຍການ Cart ທັງໝົດ - ພະນັກງານ + admin  
router.get("/carts", authCheck, listCarts);

// ດຶງລາຍລະອຽດ Cart ແຕ່ລະອັນ - ພະນັກງານ + admin
router.get("/cart/:id", authCheck, getCartById);

// ແປງ Cart ເປັນ Order (ຢືນຢັນການຂາຍ) - ພະນັກງານ + admin
router.post("/cart/:cartId/convert-to-order", authCheck, convertCartToOrder);

// ຍົກເລີກ Cart (ຄືນສະຖານະລົດເປັນ Available) - ພະນັກງານ + admin
router.delete("/cart/:cartId/cancel", authCheck, cancelCart);

// ແກ້ໄຂ Cart (ເພີ່ມ/ລົບ items) - ພະນັກງານ + admin
router.put("/cart/:cartId/update", authCheck, updateCart);

module.exports = router;