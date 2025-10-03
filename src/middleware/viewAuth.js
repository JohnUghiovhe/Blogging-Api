const jwt = require('jsonwebtoken');

// Middleware to parse token from cookies and expose current user to views
module.exports = (req, res, next) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      res.locals.currentUser = null;
      return next();
    }
    const parsed = Object.fromEntries(cookie.split(';').map(c => c.split('=').map(s=>s.trim())));
    const token = parsed.token;
    if (!token) {
      res.locals.currentUser = null;
      return next();
    }
    // Verify token and attach payload (safe for server-side rendering)
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.currentUser = {
      id: payload.id,
      email: payload.email
    };
    return next();
  } catch (err) {
    // On any error, don't block rendering; just clear user
    res.locals.currentUser = null;
    return next();
  }
};
