const express = require('express');
const blogController = require('../controllers/blogController');
const { authMiddleware } = require('../middleware/auth');
const { checkBlogOwnership } = require('../middleware/blogOwnership');

const router = express.Router();

// Protected routes (authentication required)
router.post('/', authMiddleware, blogController.createBlog);
router.get('/my-blogs', authMiddleware, blogController.getMyBlogs);

// Public routes (no authentication required)
router.get('/', blogController.getPublishedBlogs); // This now supports pagination, search, and ordering
router.get('/:id', blogController.getBlogById);

// Owner-only routes (authentication + ownership required)
router.put('/:id', authMiddleware, checkBlogOwnership, blogController.updateBlog);
router.delete('/:id', authMiddleware, checkBlogOwnership, blogController.deleteBlog);
router.patch('/:id/state', authMiddleware, checkBlogOwnership, blogController.updateBlogState);

module.exports = router;