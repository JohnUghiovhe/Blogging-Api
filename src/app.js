const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const errorHandler = require('./middleware/errorHandler');
const viewAuth = require('./middleware/viewAuth');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB (Model)
connectDB();

// Middleware

// View engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// expose current user to views (parses token from cookie)
app.use(viewAuth);

// Routes (Controller)
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Pages (Views)
app.get('/', (req, res) => res.render('users/index'));
app.get('/signin', (req, res) => res.render('users/signin', { error: null }));
app.get('/signup', (req, res) => res.render('users/signup', { error: null }));

// Error handling (View for errors)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
