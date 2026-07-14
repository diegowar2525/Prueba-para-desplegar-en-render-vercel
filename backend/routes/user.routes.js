const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Apply JWT protection middleware to all CRUD endpoints
router.use(protect);

// @desc    Get all users
// @route   GET /api/users
// @access  Private
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a user
// @route   POST /api/users
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Por favor ingrese nombre y correo electrónico' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: password || 'defaultPassword123', // fallback if none is provided
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if updating email to one that already exists
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'El correo electrónico ya está en uso' });
        }
      }
      user.email = email;
    }
    if (password) user.password = password; // pre-save hook will automatically hash this
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        googleId: user.googleId,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Prevent self-deletion if they try to delete their own account from user list (optional but helpful)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propio usuario activo' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
