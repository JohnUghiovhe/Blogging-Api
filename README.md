# Blogging API

This is a Blogging API built with Node.js and MongoDB. The API allows users to create, manage, and read blog articles. It supports user authentication and provides endpoints for both logged-in and non-logged-in users.

## Features

- User authentication with JWT
- Create, read, update, and delete blog articles
- Support for blog states: draft and published
- Pagination and filtering for blog listings
- Search functionality by author, title, and tags
- Reading time calculation for blog articles

## Requirements

- Node.js
- MongoDB

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd blog-api
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables:
   ```
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

5. Start the application:
   ```
   npm start
   ```

## API Endpoints

### Authentication

- **POST /api/auth/signup**: Register a new user
- **POST /api/auth/signin**: Sign in an existing user

### Blogs

- **GET /api/blogs**: Get a list of published blogs (paginated)
- **GET /api/blogs/:id**: Get a single blog by ID
- **POST /api/blogs**: Create a new blog (draft state)
- **PUT /api/blogs/:id/publish**: Publish a blog
- **PUT /api/blogs/:id**: Update a blog (draft or published state)
- **DELETE /api/blogs/:id**: Delete a blog
- **GET /api/users/:id/blogs**: Get a list of blogs by a specific user (paginated and filterable)

## Testing

To run tests for the API, use the following command:
```
npm test
```

## License

This project is licensed under the MIT License.