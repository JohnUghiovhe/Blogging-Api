const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB (Model)
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes (Controller)
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Error handling (View for errors)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
