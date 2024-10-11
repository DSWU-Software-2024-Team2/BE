const express = require('express');
const {LikePost, CancelLikePost} = require('../controllers/plikeController'); 
const {DislikePost, CancelDislikePost} = require('../controllers/pdlikeController'); 
const router = express.Router();

router.post('/post/:postId/like', LikePost);
router.delete('/post/:postId/like', CancelLikePost);

router.post('/post/:postId/dislike', DislikePost);
router.delete('/post/:postId/dislike', CancelDislikePost);

module.exports = router; 