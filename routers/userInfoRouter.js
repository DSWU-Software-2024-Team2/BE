// description : 내 정보 게시판 관련 라우터
const express = require('express');
const router = express.Router();
const userInfoController = require('../controllers/userInfoController');

// 01. 내 정보에서 나의 정보 불러오기
router.get('/', userInfoController.getUserInfo);

// 02. 거래내역 불러오기
router.get('/transactions', userInfoController.getUserTransactions);

module.exports = router;                                     