const request = require('supertest');
const app = require('../app');
const User = require('../models/user');
const mongoose = require('mongoose');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Authentication Endpoints', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/signup', () => {
        it('should sign up a new user', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 400 if email is already in use', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    first_name: 'Jane',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password456'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Email already in use');
        });
    });

    describe('POST /api/auth/signin', () => {
        it('should sign in an existing user', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/signin')
                .send({
                    email: 'john.doe@example.com',
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 401 if credentials are invalid', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/signin')
                .send({
                    email: 'john.doe@example.com',
                    password: 'wrongpassword'
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });
});