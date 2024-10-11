// description : 커뮤니티 게시판 관련 라우터
const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// 01. 커뮤니티 게시판 전체 목록 조회
router.get('/', communityController.getAllCommunities);

// 02. 카테고리별 커뮤니티 목록 조회 (카테고리를 파라미터로 받아서 처리)
router.get('/:category', communityController.getCommunitiesByCategory);

module.exports = router;