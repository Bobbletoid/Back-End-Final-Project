import jwt from "jsonwebtoken";

// Create function to authenticate user

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // If no authentication provided, throw error
  if (!authHeader) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  // If authentication provided, use token correctly
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  // If no token provided, throw error
  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  // Check whether provided token is valid
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}
