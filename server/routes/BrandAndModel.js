const express = require('express');
const router = express.Router();
const { authCheck, adminCheck } = require('../middleware/auth');
const { saveBrandAndModel, listBrandAndModel, readBrandAndModel, updateBrandAndModel, deleteBrandAndModel } = require('../controllters/BrandAndModel');



router.post('/brandandmodel',authCheck,adminCheck,saveBrandAndModel)
router.get('/brandandmodels',listBrandAndModel)
router.get('/brandandmodel/:id',authCheck,adminCheck,readBrandAndModel)
router.put('/brandandmodel/:id',authCheck,adminCheck,updateBrandAndModel)
router.delete('/brandandmodel/:id',authCheck,adminCheck,deleteBrandAndModel)





module.exports = router;