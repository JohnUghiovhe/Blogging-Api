const Blog = require('../models/blog');
const User = require('../models/user');
const { calculateReadingTime } = require('../utils/readingTime');

exports.getPublishedBlogs = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Search filters
        const searchQuery = { state: 'published' };
        
        // Search by author (first_name or last_name or email)
        if (req.query.author) {
            const users = await User.find({
                $or: [
                    { first_name: { $regex: req.query.author, $options: 'i' } },
                    { last_name: { $regex: req.query.author, $options: 'i' } },
                    { email: { $regex: req.query.author, $options: 'i' } }
                ]
            }).select('_id');
            
            const userIds = users.map(user => user._id);
            searchQuery.author = { $in: userIds };
        }

        // Search by title
        if (req.query.title) {
            searchQuery.title = { $regex: req.query.title, $options: 'i' };
        }

        // Search by tags
        if (req.query.tags) {
            const tagsArray = req.query.tags.split(',').map(tag => tag.trim());
            searchQuery.tags = { $in: tagsArray };
        }

        // Sorting
        let sortOptions = {};
        if (req.query.orderBy) {
            const validSortFields = ['read_count', 'reading_time', 'timestamp'];
            const sortField = req.query.orderBy;
            const sortDirection = req.query.order === 'desc' ? -1 : 1;
            
            if (validSortFields.includes(sortField)) {
                sortOptions[sortField] = sortDirection;
            } else {
                sortOptions.timestamp = -1; // Default sort by timestamp descending
            }
        } else {
            sortOptions.timestamp = -1; // Default sort
        }

        // Execute query
        const blogs = await Blog.find(searchQuery)
            .populate('author', 'first_name last_name email')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination info
        const totalBlogs = await Blog.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalBlogs / limit);

        res.status(200).json({
            blogs,
            pagination: {
                currentPage: page,
                totalPages,
                totalBlogs,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get Published Blogs Error:', error);
        res.status(500).json({ message: 'Error retrieving blogs', error: error.message });
    }
};

exports.getBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, state, author, title, tags } = req.query;
        const query = { state: state || 'published' };

        if (author) query.author = author;
        if (title) query.title = { $regex: title, $options: 'i' };
        if (tags) query.tags = { $in: tags.split(',') };

        const blogs = await Blog.find(query)
            .populate('author', 'first_name last_name email')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ read_count: -1 });

        res.status(200).json({ blogs, page, limit });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving blogs', error: error.message });
    }
}

exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id).populate('author', 'first_name last_name email');
        if (!blog || blog.state === 'draft') {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.read_count += 1;
        await blog.save();

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving blog', error: error.message });
    }
}

exports.getMyBlogs = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build query for user's blogs
        const searchQuery = { author: userId };
        
        // Filter by state if provided
        if (req.query.state) {
            if (['draft', 'published'].includes(req.query.state)) {
                searchQuery.state = req.query.state;
            } else {
                return res.status(400).json({ message: 'Invalid state. Use "draft" or "published"' });
            }
        }

        // Sorting
        let sortOptions = { timestamp: -1 }; // Default sort by newest first
        if (req.query.orderBy) {
            const validSortFields = ['timestamp', 'read_count', 'reading_time', 'state'];
            const sortField = req.query.orderBy;
            const sortDirection = req.query.order === 'asc' ? 1 : -1;
            
            if (validSortFields.includes(sortField)) {
                sortOptions = { [sortField]: sortDirection };
            }
        }

        // Execute query
        const blogs = await Blog.find(searchQuery)
            .populate('author', 'first_name last_name email')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalBlogs = await Blog.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalBlogs / limit);

        // Count blogs by state for user
        const draftCount = await Blog.countDocuments({ author: userId, state: 'draft' });
        const publishedCount = await Blog.countDocuments({ author: userId, state: 'published' });

        res.status(200).json({
            blogs,
            pagination: {
                currentPage: page,
                totalPages,
                totalBlogs,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            summary: {
                totalBlogs,
                draftBlogs: draftCount,
                publishedBlogs: publishedCount
            }
        });
    } catch (error) {
        console.error('Get My Blogs Error:', error);
        res.status(500).json({ message: 'Error retrieving your blogs', error: error.message });
    }
};

exports.createBlog = async (req, res) => {
    try {
        const { title, description, tags, body } = req.body;
        const author = req.user.id;

        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        // Check for unique title
        const existingBlog = await Blog.findOne({ title });
        if (existingBlog) {
            return res.status(400).json({ message: 'Title must be unique' });
        }

        const reading_time = calculateReadingTime(body);

        const newBlog = new Blog({
            title,
            description,
            tags,
            body,
            author,
            state: 'draft', // Blog starts in draft state
            read_count: 0,
            reading_time,
            timestamp: new Date()
        });

        await newBlog.save();
        await newBlog.populate('author', 'first_name last_name email');

        res.status(201).json({
            message: 'Blog created successfully',
            blog: newBlog
        });
    } catch (error) {
        console.error('Create Blog Error:', error);
        res.status(500).json({ message: 'Error creating blog', error: error.message });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        // Blog is already available from middleware and ownership is verified
        const blog = req.blog;
        
        const { title, description, tags, body, state } = req.body;
        
        // Check if title is unique (if being updated)
        if (title && title !== blog.title) {
            const existingBlog = await Blog.findOne({ title, _id: { $ne: blog._id } });
            if (existingBlog) {
                return res.status(400).json({ message: 'Title must be unique' });
            }
            blog.title = title;
        }
        
        // Update other fields
        if (description !== undefined) blog.description = description;
        if (tags !== undefined) blog.tags = tags;
        if (body !== undefined) {
            blog.body = body;
            blog.reading_time = calculateReadingTime(body);
        }
        
        // Update state (draft to published or published to draft)
        if (state !== undefined) {
            if (['draft', 'published'].includes(state)) {
                blog.state = state;
            } else {
                return res.status(400).json({ message: 'Invalid state. Use "draft" or "published"' });
            }
        }

        await blog.save();
        await blog.populate('author', 'first_name last_name email');

        res.status(200).json({
            message: 'Blog updated successfully',
            blog
        });
    } catch (error) {
        console.error('Update Blog Error:', error);
        res.status(500).json({ message: 'Error updating blog', error: error.message });
    }
};

// Delete blog (owner can delete in draft or published state)
exports.deleteBlog = async (req, res) => {
    try {
        // Blog is already available from middleware and ownership is verified
        const blog = req.blog;
        
        await blog.deleteOne();
        
        res.status(204).send();
    } catch (error) {
        console.error('Delete Blog Error:', error);
        res.status(500).json({ message: 'Error deleting blog', error: error.message });
    }
};

// Update blog state specifically (convenience endpoint)
exports.updateBlogState = async (req, res) => {
    try {
        const blog = req.blog;
        const { state } = req.body;
        
        if (!state || !['draft', 'published'].includes(state)) {
            return res.status(400).json({ message: 'Valid state is required. Use "draft" or "published"' });
        }
        
        blog.state = state;
        await blog.save();
        await blog.populate('author', 'first_name last_name email');
        
        res.status(200).json({
            message: `Blog ${state === 'published' ? 'published' : 'moved to draft'} successfully`,
            blog
        });
    } catch (error) {
        console.error('Update Blog State Error:', error);
        res.status(500).json({ message: 'Error updating blog state', error: error.message });
    }
};


const blogController = {
    getPublishedBlogs: exports.getPublishedBlogs,
    createBlog: exports.createBlog,
    updateBlog: exports.updateBlog,
    deleteBlog: exports.deleteBlog,
    getBlogById: exports.getBlogById,
    getMyBlogs: exports.getMyBlogs,
    updateBlogState: exports.updateBlogState,
    calculateReadingTime: exports.calculateReadingTime
};      

module.exports = blogController;