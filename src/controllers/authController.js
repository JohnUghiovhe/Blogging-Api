const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const index = (req, res) => {
    res.send('Auth Controller is working');
}

const signUp = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate JWT token (expires in 1 hour)
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set httpOnly cookie and return user info (do not send token in body)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('SignUp Error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token (expires in 1 hour)
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set httpOnly cookie and return user info
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('SignIn Error:', error);
        res.status(500).json({ message: 'Error signing in', error: error.message });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out' });
};

const me = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Not authenticated' });
        const user = await require('../models/user').findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        console.error('Me Error:', err);
        res.status(500).json({ message: 'Error retrieving user' });
    }
};

module.exports = { 
    signUp,
    signIn,
    logout,
    me
};

