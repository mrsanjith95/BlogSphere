import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { memoryAuth } from '../config/inMemoryStore.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'blogsphere_default_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      // Check if user exists in MongoDB
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }

      // Create user in MongoDB
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      });
    } else {
      // Fallback in-memory registration
      const userExists = await memoryAuth.findUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }

      const user = await memoryAuth.createUser({ name, email, password });
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      const user = await memoryAuth.findUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    return res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching profile' });
  }
};
