const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/auth");
const { saveColorCar, readColorCar, listColorCar, updateColorCar, deleteColorCar } = require("../controllters/Color");


router.post("/colorcar", authCheck, adminCheck, saveColorCar);
router.get("/colorcars", listColorCar);
router.get("/colorcar/:id", authCheck, adminCheck, readColorCar);
router.put("/colorcar/:id", authCheck, adminCheck, updateColorCar);
router.delete("/colorcar/:id", authCheck, adminCheck, deleteColorCar);

module.exports = router;
