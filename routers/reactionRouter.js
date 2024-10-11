<<<<<<< HEAD
const express = require('express');
const {LikePost, CancelLikePost} = require('../controllers/plikeController'); 
const {DislikePost, CancelDislikePost} = require('../controllers/pdlikeController'); 
const router = express.Router();

router.post('/post/:postId/like', LikePost);
router.delete('/post/:postId/like', CancelLikePost);

router.post('/post/:postId/dislike', DislikePost);
router.delete('/post/:postId/dislike', CancelDislikePost);

=======
const express = require('express');
const {LikePost, CancelLikePost} = require('../controllers/plikeController'); 
const {DislikePost, CancelDislikePost} = require('../controllers/pdlikeController'); 
const router = express.Router();

router.post('/post/:postId/like', LikePost);
router.delete('/post/:postId/like', CancelLikePost);

router.post('/post/:postId/dislike', DislikePost);
router.delete('/post/:postId/dislike', CancelDislikePost);

>>>>>>> 9aee417fa79ef433aee797247f70fe4ba33d2f72
module.exports = router; 