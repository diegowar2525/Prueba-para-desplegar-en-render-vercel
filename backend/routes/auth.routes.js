const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');


// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor complete todos los campos' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe con este correo electrónico' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor ingrese correo y contraseña' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas (usuario no existe)' });
    }

    // Check if user is registered with Google OAuth but has no password set
    if (!user.password && user.googleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Esta cuenta fue registrada con Google Login. Por favor, inicia sesión con Google.' 
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas (contraseña incorrecta)' });
    }

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Auth with Google
// @route   GET /api/auth/google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id);
    
    // Redirect to frontend dashboard with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
  }
);

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

