const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Blogging API',
      version: '1.0.0',
      description: 'API documentation for authentication and blog management endpoints.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error (optional)' }
          }
        },
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '67ca4cc27cb710a9543e2f1a' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' }
          }
        },
        BlogAuthor: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67ca4cc27cb710a9543e2f1a' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' }
          }
        },
        Blog: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67ca5e8fd65af8d75f0f2ca8' },
            title: { type: 'string', example: 'Getting Started with Node.js' },
            description: { type: 'string', example: 'A quick guide to Node.js fundamentals.' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['nodejs', 'backend']
            },
            author: { $ref: '#/components/schemas/BlogAuthor' },
            state: { type: 'string', enum: ['draft', 'published'], example: 'published' },
            read_count: { type: 'integer', example: 4 },
            reading_time: { type: 'string', example: '3 min read' },
            body: { type: 'string', example: 'Blog body content...' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 3 },
            totalBlogs: { type: 'integer', example: 55 },
            limit: { type: 'integer', example: 20 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login successful' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/UserPublic' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
