const express = require("express");
const { authCheck, adminCheck } = require("../middleware/auth");
const {
  saveCar,
  UploadImages,
  RemoveImage,
  UploadImaged,
  listCar,
  readCar,
  updateCar,
  removeCar,
} = require("../controllters/Cra");

const router = express.Router();

router.post("/car", authCheck, adminCheck, saveCar);
router.get("/cars", authCheck, listCar);
router.get("/car/:id", authCheck, readCar);
router.put("/car/:id", authCheck, adminCheck, updateCar);
router.delete("/car/:id", authCheck, adminCheck, removeCar);

router.post("/images", authCheck, adminCheck, UploadImages);
router.post("/removeimage", authCheck, adminCheck, RemoveImage);
router.post("/imaged", authCheck, adminCheck, UploadImaged);

module.exports = router;
