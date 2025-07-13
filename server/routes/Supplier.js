const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/auth");
const {
  saveSupplier,
  readSupplier,
  listSuppliers,
  updateSupplier,
  removeSupplier,
  searchSuppliers,
  listSuppliersenabled,
} = require("../controllters/Supplier");

// ສ້າງຜູ້ສະໜອງໃໝ່
router.post("/supplier", authCheck, adminCheck, saveSupplier);

// ອ່ານຜູ້ສະໜອງທັງໝົດ
router.get("/suppliers", authCheck, listSuppliers);

router.get("/suppliersenabled", authCheck, listSuppliersenabled);

// ອ່ານຜູ້ສະໜອງແຕ່ລະລາຍ
router.get("/supplier/:id", authCheck, adminCheck, readSupplier);

// ອັບເດດຜູ້ສະໜອງ
router.put("/supplier/:id", authCheck, adminCheck, updateSupplier);

// ລົບຼູ້ສະໜອງ
router.delete("/supplier/:id", authCheck, adminCheck, removeSupplier);

// ຄົ້ນຫາຜູ້ສະໜອງ
router.post("/suppliers/search", searchSuppliers);

module.exports = router;
