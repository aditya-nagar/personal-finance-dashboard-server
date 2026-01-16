// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies?.token;

    // 2. If token does not exist
    if (!token) {
      return res.status(401).json({
        message: "Access denied. Please login first.",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user data to request
    req.user = decoded;

    // 5. Move to next middleware / controller
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;