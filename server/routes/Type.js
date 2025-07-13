const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/auth");
const {
  saveType,
  listType,
  readType,
  updateType,
  deleteType,
} = require("../controllters/Type");

router.post("/typecar", authCheck, adminCheck, saveType);
router.get("/typecars", listType);
router.get("/typecar/:id", authCheck, adminCheck, readType);
router.put("/typecar/:id", authCheck, adminCheck, updateType);
router.delete("/typecar/:id", authCheck, adminCheck, deleteType);

module.exports = router;
