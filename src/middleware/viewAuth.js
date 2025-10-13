const jwt = require('jsonwebtoken');

// Middleware to parse token from cookies and expose current user to views
module.exports = (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) {
      res.locals.currentUser = null;
      return next();
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.currentUser = { id: payload.id, email: payload.email };
    return next();
  } catch (err) {
    // On any error, don't block rendering; just clear user
    res.locals.currentUser = null;
    return next();
  }
};
