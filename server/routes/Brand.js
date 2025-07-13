const express = require('express');
const router = express.Router();
const { authCheck, adminCheck } = require('../middleware/auth');
const { savebrand, listbrand, readbrand, updateBrand, deleteBrand } = require('../controllters/Brand');


router.post('/brand',authCheck,adminCheck,savebrand)
router.get('/brands',listbrand)
router.get('/brand/:id',authCheck,adminCheck,readbrand)
router.put('/brand/:id',authCheck,adminCheck,updateBrand)
router.delete('/brand/:id',authCheck,adminCheck,deleteBrand)





module.exports = router;