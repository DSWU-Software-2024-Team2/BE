// description : 정보게시판 게시판 관련 라우터
const express = require('express');
const router = express.Router();
infoController = require('../controllers/infoController'); 

// 01. 교내 정보 게시물 조회 
router.get('/campus', infoController.getCampusInfoPosts);

// 02. 교외 정보 게시물 조회 
router.get('/external', infoController.getExternalInfoPosts);

// 03. 자격증 정보 게시물 조회 
router.get('/certifications', infoController.getCertificationInfoPosts);

// 04. 공모전 정보 게시물 조회 
router.get('/contests', infoController.getContestInfoPosts);

// 06. 정보 게시판 채용 목록
//router.get('/jobs', infoController.getJobInfoPosts);

module.exports = router;