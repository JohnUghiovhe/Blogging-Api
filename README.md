# Blogging API

A full-stack blogging platform built with Node.js, Express, MongoDB, EJS, and JWT authentication.
It provides both JSON API endpoints and server-rendered pages for blog discovery and author workflows.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Authentication](#authentication)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [API Reference](#api-reference)
- [Web Routes (EJS Pages)](#web-routes-ejs-pages)
- [Data Models](#data-models)
- [Testing](#testing)
- [Error Handling Notes](#error-handling-notes)
- [License](#license)

## Overview

This project exposes:

- RESTful authentication and blog APIs under `/api/*`
- A Swagger UI for interactive API exploration at `/api-docs`
- EJS-rendered pages for sign-in/sign-up and blog UI flows

The API supports draft/published blog states, ownership-based updates/deletes, search/filter/sort/pagination, highlight feeds, and related-blog discovery.

## Features

- User registration and login with JWT
- JWT auth via either Bearer token or secure httpOnly cookie (`token`)
- Create, update, publish/unpublish, and delete blog posts
- Owner-only write operations for blogs
- Public published-blog feed with:
  - pagination (`page`, `limit`)
  - search (`q`) across title, description, body, and tags
  - filters (`author`, `title`, `tags`, `minReadCount`)
  - sorting (`orderBy`, `order`)
- Blog highlights endpoint with trending posts, latest posts, top tags, and global stats
- Single blog detail endpoint that increments `read_count` and returns `relatedBlogs`
- Reading time estimation from blog body content

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- EJS
- JWT (`jsonwebtoken`)
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- Jest + Supertest

## Project Structure

```text
src/
  app.js                 # Express app bootstrap and route mounting
  config/
    db.js                # MongoDB connection
    swagger.js           # OpenAPI schema generation
  controllers/
    authController.js
    blogController.js
  middleware/
    auth.js              # JWT auth middleware
    blogOwnership.js     # Owner checks for blog writes
    errorHandler.js
    viewAuth.js          # Exposes logged-in user to EJS views
  models/
    user.js
    blog.js
  routes/
    authRoutes.js
    blogRoutes.js
  views/                 # EJS templates
  public/                # Static assets
  tests/
    auth.test.js
    blog.test.js
```

## Getting Started

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root.
4. Start the app in development mode:

```bash
npm run dev
```

5. Open:

- App: `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`

## Environment Variables

Create `.env` with:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/blog-api
JWT_SECRET=replace_with_a_strong_secret
PORT=5000
NODE_ENV=development
```

Notes:

- `MONGODB_URI` and `JWT_SECRET` are required.
- In production (`NODE_ENV=production`), auth cookies are marked `secure: true`.

## Available Scripts

- `npm run dev`: Run with nodemon
- `npm start`: Run with Node
- `npm test`: Run Jest test suite

## Authentication

Protected endpoints accept JWT in either form:

- `Authorization: Bearer <token>` header
- `token` cookie (httpOnly cookie set on signin/signup)

Token payload contains:

- `id`
- `email`

## API Documentation (Swagger)

- Route: `GET /api-docs`
- OpenAPI version: `3.0.3`
- Local server in spec: `http://localhost:5000`

Swagger docs are generated from route annotations in `src/routes/*.js`.

## API Reference

Base URL (local): `http://localhost:5000`

### Auth Endpoints

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Register a new user |
| POST | `/api/auth/signin` | No | Login user |
| GET | `/api/auth/logout` | No | Clear auth cookie |
| GET | `/api/auth/me` | Yes | Get current authenticated user |

Signup request body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

Signin request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Auth success response shape:

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": "<user_id>",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

### Blog Endpoints

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| GET | `/api/blogs` | No | List published blogs with filters/sort/pagination |
| GET | `/api/blogs/highlights` | No | Trending, latest, top tags, and aggregate stats |
| GET | `/api/blogs/:id` | No | Get one blog by id, increment reads for published blogs, include related blogs (drafts are owner-only) |
| POST | `/api/blogs` | Yes | Create a blog |
| GET | `/api/blogs/my-blogs` | Yes | Get current user's blogs, pagination, summary |
| PUT | `/api/blogs/:id` | Yes (owner) | Update a blog |
| PATCH | `/api/blogs/:id/state` | Yes (owner) | Change state to `draft` or `published` |
| DELETE | `/api/blogs/:id` | Yes (owner) | Delete a blog |

#### `GET /api/blogs` query parameters

- `page` (number, default `1`)
- `limit` (number, default `20`)
- `author` (matches user `first_name`, `last_name`, or `email`)
- `title` (case-insensitive partial match)
- `tags` (comma-separated list)
- `q` (case-insensitive keyword search across title/description/body/tags)
- `minReadCount` (minimum read count)
- `orderBy` (`read_count`, `reading_time`, `timestamp`)
- `order` (`asc`, `desc`)

Example:

```http
GET /api/blogs?page=1&limit=10&q=nodejs&tags=backend,express&orderBy=read_count&order=desc
```

Response shape:

```json
{
  "blogs": [],
  "filters": {
    "author": null,
    "title": null,
    "tags": "backend,express",
    "q": "nodejs",
    "orderBy": "read_count",
    "order": "desc"
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalBlogs": 0,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### `POST /api/blogs` request body

```json
{
  "title": "Getting Started with Express",
  "description": "A quick intro",
  "tags": ["express", "nodejs"],
  "body": "Blog body...",
  "state": "draft"
}
```

Rules:

- `title` and `body` are required.
- `title` must be unique.
- `state` defaults to `draft` unless explicitly set to `published`.
- `tags` can be an array or comma-separated string and will be normalized.

#### `GET /api/blogs/my-blogs` query parameters

- `page`, `limit`
- `state` (`draft` or `published`)
- `orderBy` (`timestamp`, `read_count`, `reading_time`, `state`)
- `order` (`asc` or `desc`)

Response includes:

- `blogs`
- `pagination`
- `summary` (`totalBlogs`, `draftBlogs`, `publishedBlogs`)

#### `PATCH /api/blogs/:id/state` body

```json
{
  "state": "published"
}
```

### Common API Status Codes

- `200`: Success
- `201`: Resource created
- `204`: Resource deleted (no body)
- `400`: Validation error / invalid token / invalid payload
- `401`: Unauthorized (missing or invalid credentials)
- `403`: Forbidden (not owner)
- `404`: Resource not found
- `500`: Internal server error

## Web Routes (EJS Pages)

- `GET /` - Landing page
- `GET /signin` - Sign in page
- `GET /signup` - Sign up page
- `GET /blogs` - Blog listing page
- `GET /blogs/new` - New blog page
- `GET /blogs/my-blogs` - Author dashboard page
- `GET /blogs/:id` - Blog details page
- `GET /blogs/:id/edit` - Edit blog page

Static files are served from `/static`.

## Data Models

### User

- `first_name` (string, required)
- `last_name` (string, required)
- `email` (string, required, unique)
- `phone` (string, optional)
- `password` (string, required, min length `6`)
- `created_at` (date)

### Blog

- `title` (string, required, unique)
- `description` (string, optional)
- `tags` (array of strings)
- `author` (ObjectId -> `User`, required)
- `state` (`draft` or `published`, default `draft`)
- `read_count` (number, default `0`)
- `reading_time` (string)
- `body` (string, required)
- `timestamp` (date)

## Testing

Run all tests:

```bash
npm test
```

Test notes:

- Tests use Jest + Supertest.
- Tests require working `MONGODB_URI` and `JWT_SECRET` in environment.
- Existing tests connect to your configured MongoDB instance.

## Error Handling Notes

- Global error middleware is registered in `src/app.js`.
- Process-level handlers log unhandled rejections and uncaught exceptions.
- Authentication middleware returns:
  - `401` when token is missing
  - `400` when token is invalid

## License

ISC