const express = require('express');
const {LikePost, CancelLikePost} = require('../controllers/plikeController'); 
const {DislikePost, CancelDislikePost} = require('../controllers/pdlikeController'); 
const router = express.Router();

router.post('/:id/like', LikePost);
router.delete('/:id/like', CancelLikePost);

router.post('/:id/dislike', DislikePost);
router.delete('/:id/dislike', CancelDislikePost);

module.exports = router; 