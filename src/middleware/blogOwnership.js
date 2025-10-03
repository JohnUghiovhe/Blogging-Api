const Blog = require('../models/blog');

const checkBlogOwnership = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        
        // Check if the authenticated user is the owner
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only modify your own blogs.' });
        }
        
        req.blog = blog; // Pass blog to next middleware/controller
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking blog ownership', error: error.message });
    }
};

module.exports = { checkBlogOwnership };
