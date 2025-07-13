const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/auth");
const { 
  savePurchase, 
  readPurchase, 
  listPurchases, 
  updatePurchase, 
  removePurchase,
  searchPurchases,
  updatePurchaseStatus
} = require("../controllters/Purchase");

// ສ້າງໃບສັ່ງຊື້ໃໝ່
router.post("/purchase", authCheck, savePurchase);

// ອ່ານໃບສັ່ງຊື້ທັງໝົດ (ສາມາດກັ່ນຕອງດ້ວຍ query parameters)
// ຕົວຢ່າງ: /api/purchases?status=PENDING&supplierId=1
router.get("/purchases", authCheck, listPurchases);

// ອ່ານໃບສັ່ງຊື້ແຕ່ລະໃບ
router.get("/purchase/:id", authCheck, readPurchase);

// ອັບເດດໃບສັ່ງຊື້
router.put("/purchase/:id", authCheck, adminCheck, updatePurchase);

// ລົບໃບສັ່ງຊື້
router.delete("/purchase/:id", authCheck, adminCheck, removePurchase);

// ຄົ້ນຫາໃບສັ່ງຊື້
router.post("/purchases/search", authCheck, searchPurchases);

// ປ່ຽນສະຖານະໃບສັ່ງຊື້
router.patch("/purchase/:id/status", authCheck, adminCheck, updatePurchaseStatus);

module.exports = router;