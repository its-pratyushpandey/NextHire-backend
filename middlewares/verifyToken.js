// backend/middleware/verifyToken.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from "../models/user.model.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  try {
    // Get token from both cookies and Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Please login to access this resource',
        success: false 
      });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({
        message: 'Server misconfiguration: JWT_SECRET is not set.',
        success: false
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check userId
      if (!decoded.userId) {
        throw new Error('Invalid token format: userId is missing');
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          message: "User not found",
          success: false
        });
      }

      // Attach user
      req.user = user;
      req.id = user._id;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        message: `Authentication failed: ${jwtError.message}`,
        success: false
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error: ${error.message}`,
      success: false
    });
  }
};

export default verifyToken;
