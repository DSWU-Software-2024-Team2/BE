<<<<<<< HEAD
const express = require('express');
const {Newpost,EditPost,GetPost} = require('../controllers/postController'); 
const router = express.Router();

router.post('/newpost', Newpost); 
router.post('/editpost/:id', EditPost); 
router.get('/getpost/:id', GetPost); 

=======
const express = require('express');
const {Newpost,EditPost,GetPost} = require('../controllers/postController'); 
const router = express.Router();

router.post('/newpost', Newpost); 
router.post('/editpost/:id', EditPost); 
router.get('/getpost/:id', GetPost); 

>>>>>>> 9aee417fa79ef433aee797247f70fe4ba33d2f72
module.exports = router; 