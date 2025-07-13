const express = require("express");
const { authCheck, adminCheck } = require("../middleware/auth");
const { saveCustomer, listCustomers, listCustomersEnabled, readCustomer, updateCustomer, removeCustomer, UploadImaged, RemoveImage } = require("../controllters/Customer");

const router = express.Router();

router.post("/customer", authCheck, adminCheck, saveCustomer);
router.get("/customers", authCheck, listCustomers);
router.get("/customersenabled", authCheck, listCustomersEnabled);  
router.get("/customer/:id", authCheck, readCustomer);
router.put("/customer/:id", authCheck, adminCheck, updateCustomer);
router.delete("/customer/:id", authCheck, adminCheck, removeCustomer);
// router.post("/search/filters", authCheck);

// router.post("/images", authCheck, adminCheck, UploadImages);
router.post("/removeimage", authCheck, adminCheck, RemoveImage);
router.post("/imaged", authCheck, adminCheck, UploadImaged);

module.exports = router;
