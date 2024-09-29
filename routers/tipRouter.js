// description : 꿀팁 게시판 관련 라우터
const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');

// 01. 꿀팁 게시판 전체 목록 조회
router.get('/', tipController.getAllTips);

// 02. 카테고리별 꿀팁 목록 조회 (카테고리를 파라미터로 받아서 처리)
router.get('/:category', tipController.getTipsByCategory);

module.exports = router;