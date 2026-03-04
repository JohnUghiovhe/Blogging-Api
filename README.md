# Blogging API

A full-stack blogging application built with Node.js, Express, MongoDB, EJS, and JWT-based authentication.
The project includes a major UI refresh and expanded functionality for discovery, content management, and analytics.

### Massive Functionality Upgrade
- Advanced published blog filtering:
  - keyword (`q`) across title/description/body/tags
  - author, title, tags filters
  - sorting and order controls
  - pagination controls
- New highlights API endpoint:
  - trending blogs
  - latest blogs
  - top tags
  - global stats
- Blog details now include `relatedBlogs`
- Blog creation now supports initial `state` (`draft` or `published`)
- Better tag normalization for create/update operations
- Added `npm run dev` for local development with nodemon

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- EJS templates
- JWT authentication (httpOnly cookie support)
- Jest + Supertest

## Requirements
- Node.js 18+
- MongoDB

## Setup

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` in project root:
   ```env
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   PORT=5000
   NODE_ENV=development
   ```
4. Start in development mode:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` - Start with nodemon
- `npm start` - Start with node
- `npm test` - Run test suite

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Current authenticated user

### Blogs
- `GET /api/blogs` - List published blogs with filtering/pagination
  - Query params:
    - `page`, `limit`
    - `author`, `title`, `tags`
    - `q` (keyword search)
    - `orderBy` (`timestamp`, `read_count`, `reading_time`)
    - `order` (`asc`, `desc`)
- `GET /api/blogs/highlights` - Trending/latest/top-tags/global stats
- `GET /api/blogs/:id` - Get a blog, increment reads, include `relatedBlogs`
- `POST /api/blogs` - Create blog (auth required)
- `GET /api/blogs/my-blogs` - Get current user blogs + summary (auth required)
- `PUT /api/blogs/:id` - Update blog (owner only)
- `PATCH /api/blogs/:id/state` - Toggle draft/published (owner only)
- `DELETE /api/blogs/:id` - Delete blog (owner only)

## Web Pages
- `/` - Landing page
- `/signin` - Sign in
- `/signup` - Sign up
- `/blogs` - Public blog listing with filters and highlights
- `/blogs/new` - Create blog
- `/blogs/my-blogs` - Author dashboard
- `/blogs/:id` - Blog details + related posts
- `/blogs/:id/edit` - Edit blog

## Testing
Run:

```bash
npm test
```

## License

ISC