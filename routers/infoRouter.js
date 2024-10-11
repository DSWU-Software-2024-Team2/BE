const express = require('express');
const router = express.Router();
infoController = require('../controllers/infoController'); 

// 01. 정보 게시판 전체 목록
//router.get('/info-posts', getAllInfoPosts);

// 02. 정보 게시판 교내 목록
router.get('/campus', infoController.getCampusInfoPosts);

// 03. 정보 게시판 교외 목록
//router.get('/external', infoController.getExternalInfoPosts);

// 04. 정보 게시판 자격증 목록
//router.get('/certifications', infoController.getCertificationInfoPosts);

// 05. 정보 게시판 공모전 목록
//router.get('/contests', infoController.getContestInfoPosts);

// 06. 정보 게시판 채용 목록
//router.get('/jobs', infoController.getJobInfoPosts);

module.exports = router;