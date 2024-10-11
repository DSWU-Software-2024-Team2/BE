const express = require('express');
const router = express.Router();
const {
    getCampusInfoPosts,
} = require('../controllers/infoController'); // 컨트롤러 경로에 맞게 수정 // 컨트롤러 경로에 맞게 수정

// 01. 정보 게시판 전체 목록
//router.get('/info-posts', getAllInfoPosts);

// 02. 정보 게시판 교내 목록
router.get('/campus', getCampusInfoPosts);

// 03. 정보 게시판 교외 목록
//router.get('/external', getExternalInfoPosts);

// 04. 정보 게시판 자격증 목록
//router.get('/certifications', getCertificationInfoPosts);

// 05. 정보 게시판 공모전 목록
//router.get('/contests', getContestInfoPosts);

// 06. 정보 게시판 채용 목록
//router.get('/jobs', getJobInfoPosts);

module.exports = router;