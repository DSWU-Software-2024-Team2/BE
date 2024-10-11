// description : 결제 관련 라우터
const express = require('express');
const router = express.Router();
const payController = require('../controllers/payController');

// 01. 결제 로직
router.post('/', payController.processPayment);

// 02. 바로 결제
router.post('/direct',  payController.directPayment);

module.exports = router;