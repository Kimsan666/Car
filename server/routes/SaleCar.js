const express = require("express");
const { authCheck, adminCheck } = require("../middleware/auth");

const {
  saveSaleCar,
  readSaleCar,
  updateSaleCar,
  removeSaleCar,
  listSaleCar,
} = require("../controllters/SaleCar");

const router = express.Router();

router.post("/salecar", authCheck, adminCheck, saveSaleCar);
router.get("/salecars", authCheck, listSaleCar);
router.get("/salecar/:id", authCheck, readSaleCar);
router.put("/salecar/:id", authCheck, adminCheck, updateSaleCar);
router.delete("/salecar/:id", authCheck, adminCheck, removeSaleCar);

module.exports = router;
