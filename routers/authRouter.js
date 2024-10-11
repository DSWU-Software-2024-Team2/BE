// description : 로그인 및 회원가입 관련 라우터
const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

// 01. 로그인 기능
router.post('/login', login);

module.exports = router;
