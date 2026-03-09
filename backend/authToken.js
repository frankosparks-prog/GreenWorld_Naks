const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers["authorization"]?.split(" ")[1];

    // Check if the token exists
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach the user information to the request object

    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    // Handle specific JWT errors for better feedback
    const message =
      error.name === "TokenExpiredError"
        ? "Token has expired"
        : error.name === "JsonWebTokenError"
        ? "Invalid token"
        : "Token verification failed";

    return res.status(401).json({ message, error: error.message });
  }
};
