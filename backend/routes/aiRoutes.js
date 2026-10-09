const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateCaption,
    generateHashtags,
    contentIdeas,
    optimizeCaption,
    improveCaption,
    generateCta,
    rewriteContent
} = require('../controllers/aiController');

router.use(protect);

router.post('/generate-caption', generateCaption);
router.post('/generate-hashtags', generateHashtags);
router.post('/content-ideas', contentIdeas);
router.post('/optimize-caption', optimizeCaption);
router.post('/improve-caption', improveCaption);
router.post('/generate-cta', generateCta);
router.post('/rewrite-content', rewriteContent);

module.exports = router;
