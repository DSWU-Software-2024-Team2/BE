const express = require('express');
const {Newpost,EditPost,GetPost} = require('../controllers/postController'); 
const router = express.Router();

router.post('/newpost', Newpost); 
router.post('/editpost/:id', EditPost); 
router.get('/getpost/:id', GetPost); 

module.exports = router; 