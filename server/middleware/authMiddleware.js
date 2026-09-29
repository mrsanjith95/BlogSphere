import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { memoryAuth } from '../config/inMemoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'blogsphere_default_secret'
      );

      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const found = await memoryAuth.findUserById(decoded.id);
        if (found) {
          const { password, ...userWithoutPass } = found;
          req.user = userWithoutPass;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res
        .status(401)
        .json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
