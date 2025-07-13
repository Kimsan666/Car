const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/auth");
const { 
  saveInputCar, 
  readInputCar, 
  listInputCars, 
  updateInputCar, 
  removeInputCar,
  searchInputCars,
  updateInputCarStatus,
  receiveActualCars
} = require("../controllters/InputCar");

// ສ້າງລາຍການນຳເຂົ້າໃໝ່
router.post("/input-car", authCheck, saveInputCar);

// ອ່ານລາຍການນຳເຂົ້າທັງໝົດ (ສາມາດກັ່ນຕອງດ້ວຍ query parameters)
// ຕົວຢ່າງ: /api/input-cars?status=PENDING&supplierId=1
router.get("/input-cars", authCheck, listInputCars);

// ອ່ານລາຍການນຳເຂົ້າແຕ່ລະລາຍການ
router.get("/input-car/:id", authCheck, readInputCar);

// ອັບເດດລາຍການນຳເຂົ້າ
router.put("/input-car/:id", authCheck, adminCheck, updateInputCar);

// ລົບລາຍການນຳເຂົ້າ
router.delete("/input-car/:id", authCheck, adminCheck, removeInputCar);

// ຄົ້ນຫາລາຍການນຳເຂົ້າ
router.post("/input-cars/search", authCheck, searchInputCars);

// ປ່ຽນສະຖານະລາຍການນຳເຂົ້າ
router.patch("/input-car/:id/status", authCheck, adminCheck, updateInputCarStatus);

// ບັນທຶກລົດຈິງທີ່ໄດ້ຮັບ (ສຳລັບເມື່ອໄດ້ຮັບສິນຄ້າຈິງ)
router.post("/input-car/:id/receive-cars", authCheck, receiveActualCars);

module.exports = router;