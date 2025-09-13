// Import jwt and User model
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Auth middleware
const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from multiple sources
        let token = req.cookies.token;
        
        // If no cookie, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({
                message: "Please login to access this resource",
                success: false
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: 'Server misconfiguration: JWT_SECRET is not set.',
                success: false
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
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

            // Log successful authentication
            console.log('Authentication successful:', {
                userId: decoded.userId,
                userEmail: user.email,
                path: req.path,
                method: req.method
            });

            next();
        } catch (jwtError) {
            // JWT error
            console.error('JWT verification failed:', {
                error: jwtError.message,
                path: req.path,
                token: token ? `${token.substring(0, 10)}...` : null
            });

            return res.status(401).json({
                message: `Authentication failed: ${jwtError.message}`,
                success: false
            });
        }
    } catch (error) {
        // Other error
        console.error('Authentication error:', {
            error: error.message,
            path: req.path
        });

        return res.status(500).json({
            message: `Internal server error: ${error.message}`,
            success: false
        });
    }
};

export default isAuthenticated;