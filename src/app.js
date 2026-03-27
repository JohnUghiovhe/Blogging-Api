const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const viewAuth = require('./middleware/viewAuth');
const connectDB = require('./config/db');
require('dotenv').config();

// Global error handlers to capture unexpected crashes and log stacks
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason && reason.stack ? reason.stack : reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err && err.stack ? err.stack : err);
});

const app = express();

// Connect to MongoDB (Model)
connectDB().catch((error) => {
    console.error('Initial DB connection failed:', error && error.stack ? error.stack : error);
});

// Middleware

// View engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// expose current user to views (parses token from cookie)
app.use(cookieParser());
app.use(viewAuth);

// Serve static assets
app.use('/static', express.static(path.join(__dirname, 'public')));

// Routes (Controller)
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Pages (Views)
app.get('/', (req, res) => res.render('users/index'));
app.get('/signin', (req, res) => res.render('users/signin', { error: null }));
app.get('/signup', (req, res) => res.render('users/signup', { error: null }));

// Blog pages (rendered views)
app.get('/blogs', (req, res) => {
    return res.render('blogs/index');
});

app.get('/blogs/new', (req, res) => {
    return res.render('blogs/new');
});

app.get('/blogs/my-blogs', (req, res) => {
    return res.render('blogs/my-blogs');
});

app.get('/blogs/:id/edit', (req, res) => {
    return res.render('blogs/edit');
});

app.get('/blogs/:id', (req, res) => {
    return res.render('blogs/show');
});

// Error handling (View for errors)
app.use(errorHandler);

// Start the server only when run directly (local dev/runtime).
// In serverless environments (e.g. Vercel), export the app without binding to a port.
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
