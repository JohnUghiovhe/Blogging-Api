const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Blog API', () => {
    let token;
    let userId;
    let blog; // Add this variable to store the created blog

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Hash password before creating user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            first_name: 'Test',
            last_name: 'User',
            email: 'testuser@example.com',
            password: hashedPassword
        });
        userId = user._id;

        // Generate token
        token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        await Blog.deleteMany({});
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    it('should create a new blog', async () => {
        const response = await request(app)
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Blog',
                description: 'This is a test blog.',
                tags: ['test', 'blog'],
                body: 'This is the body of the test blog.'
            });
        
        // Debug logging
        if (response.status !== 201) {
            console.log('Create Blog Error Response:', response.body);
            console.log('Create Blog Status:', response.status);
        }
        
        expect(response.status).toBe(201);
        expect(response.body.blog.title).toBe('Test Blog');
        
        // Store the created blog for use in other tests
        blog = response.body.blog;
    });

    it('should get a list of published blogs', async () => {
        const response = await request(app)
            .get('/api/blogs')
            .query({ state: 'published' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('blogs');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.blogs)).toBe(true);
    });

    it('should update a blog', async () => {
        const response = await request(app)
            .put(`/api/blogs/${blog._id}`) // Now blog is defined
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Test Blog',
                description: 'This is an updated test blog.',
                tags: ['updated', 'blog'],
                body: 'This is the updated body of the test blog.',
                state: 'published'
            });
            
        // Debug logging
        if (response.status !== 200) {
            console.log('Update Blog Error Response:', response.body);
            console.log('Update Blog Status:', response.status);
        }
        
        expect(response.status).toBe(200);
        expect(response.body.blog.title).toBe('Updated Test Blog');
    });

    it('should delete a blog', async () => {
        const response = await request(app)
            .delete(`/api/blogs/${blog._id}`) // Now blog is defined
            .set('Authorization', `Bearer ${token}`);
            
        // Debug logging
        if (response.status !== 204) {
            console.log('Delete Blog Error Response:', response.body);
            console.log('Delete Blog Status:', response.status);
        }
        
        expect(response.status).toBe(204);
    });

    it('should get a single blog and increment read count', async () => {
        // First create a published blog for this test
        const createResponse = await request(app)
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Published Test Blog',
                description: 'This is a published test blog.',
                tags: ['published', 'blog'],
                body: 'This is the body of the published test blog.',
                state: 'published'
            });

        const publishedBlog = createResponse.body.blog;

        // Update the blog to published state
        await request(app)
            .put(`/api/blogs/${publishedBlog._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ state: 'published' });

        // Now get the published blog
        const response = await request(app)
            .get(`/api/blogs/${publishedBlog._id}`);
            
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Published Test Blog');
        expect(response.body.read_count).toBeGreaterThan(0);
    });
});