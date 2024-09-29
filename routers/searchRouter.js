// description : 검색 관련 라우터
const express = require('express');
const {
    searchPosts,
    searchAll,
    getRealTimeKeywords,
    saveSearchKeyword,
} = require('../controllers/searchController'); 
const router = express.Router();

// 01. 카테고리별 검색
router.get('/', searchPosts); 

// 02. 전체 검색
router.get('/all', searchAll); 

// 03. 실시간 검색어 순위 10개
router.get('/real-time-keywords', getRealTimeKeywords); 

// 04. 검색어 저장 및 카운팅
router.post('/keyword', saveSearchKeyword); 

module.exports = router; 
