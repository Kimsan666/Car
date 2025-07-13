const express = require("express");
const { register, login, currentUser } = require("../controllters/auth");
const { authCheck, adminCheck } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/current-user", authCheck, currentUser);
router.post("/current-admin", authCheck, adminCheck, currentUser);

module.exports = router;
