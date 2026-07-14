const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado. Token inválido.' });
      }

      next();
    } catch (error) {
      console.error('Error al verificar JWT:', error.message);
      return res.status(401).json({ success: false, message: 'No autorizado, token fallido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No autorizado, no se proporcionó ningún token' });
  }
};

module.exports = { protect };
