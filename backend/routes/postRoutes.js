const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
    createPost,
    uploadMedia,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostAnalytics
} = require('../controllers/postController');

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

// File filter (images, videos, and audio only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Please upload an image, video, or audio file.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2000 * 1024 * 1024 } // 2GB max
});

// Routes
router.route('/')
    .post(protect, createPost)
    .get(protect, getPosts);

router.get('/scheduled', protect, require('../controllers/postController').getScheduledPosts);

router.post('/media', protect, upload.single('media'), uploadMedia);

// Combine media (photo/video) + music
const { createVideoWithMusic } = require('../controllers/videoController');
router.post('/combine-media-music', protect, upload.single('media'), createVideoWithMusic);

router.post('/:id/schedule', protect, require('../controllers/postController').schedulePost);
router.put('/:id/reschedule', protect, require('../controllers/postController').reschedulePost);
router.post('/:id/unschedule', protect, require('../controllers/postController').unschedulePost);
router.post('/:id/publish', protect, require('../controllers/postController').publishNow);
router.post('/:id/retry', protect, require('../controllers/postController').publishNow);

router.route('/:id')
    .get(protect, getPostById)
    .put(protect, updatePost)
    .delete(protect, deletePost);

router.get('/:id/analytics', protect, getPostAnalytics);

module.exports = router;
