const express = require("express");
const { authCheck, adminCheck } = require("../middleware/auth");
const router = express.Router();


router.post("/sale", authCheck, adminCheck);
router.get("/sales", authCheck);
router.get("/sale/:id", authCheck, adminCheck);
router.put("/sale/:id", authCheck, adminCheck);
router.delete("/sale/:id", authCheck, adminCheck);

module.exports = router;