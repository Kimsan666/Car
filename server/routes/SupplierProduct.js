const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/auth");
const { 
  saveSupplierProduct, 
  readSupplierProduct, 
  listSupplierProducts, 
  updateSupplierProduct, 
  removeSupplierProduct,
  searchSupplierProducts,
  toggleSupplierProduct
} = require("../controllters/SupplierProduct");

// ສ້າງການເຊື່ອມຕໍ່ຜູ້ສະໜອງກັບລົດໃໝ່
router.post("/supplier-product", authCheck, adminCheck, saveSupplierProduct);

// ອ່ານການເຊື່ອມຕໍ່ທັງໝົດ (ສາມາດກັ່ນຕອງດ້ວຍ query parameters)
// ຕົວຢ່າງ: /api/supplier-products?supplierId=1&isActive=true
router.get("/supplier-products", listSupplierProducts);

// ອ່ານການເຊື່ອມຕໍ່ແຕ່ລະລາຍການ
router.get("/supplier-product/:id", authCheck, adminCheck, readSupplierProduct);

// ອັບເດດການເຊື່ອມຕໍ່
router.put("/supplier-product/:id", authCheck, adminCheck, updateSupplierProduct);

// ລົບການເຊື່ອມຕໍ່
router.delete("/supplier-product/:id", authCheck, adminCheck, removeSupplierProduct);


// ເປີດ/ປິດການເຊື່ອມຕໍ່
router.patch("/supplier-product/:id/toggle", authCheck, adminCheck, toggleSupplierProduct);

module.exports = router;