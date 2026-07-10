import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    console.log("Received cookies:", req.cookies);

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;
