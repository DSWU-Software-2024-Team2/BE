const express = require('express');
const upload = require('../middlewares/postUpload');
const {Newpost,EditPost,GetPost} = require('../controllers/postController'); 
const router = express.Router();

// 01. 새로운 게시글 작성
router.post('/newpost', upload, Newpost); 

// 02. 게시글 수정
router.post('/editpost/:id', EditPost); 

//03. 유/무료 게시글 조회
router.get('/getpost/:id', GetPost); 

module.exports = router; 