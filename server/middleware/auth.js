const User = require("../models/user");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_testing';

const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No authentication token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ error: "User associated with this token not found." });
        }

        req.user = user;
        
        next();
    } catch (err) {
        console.error("JWT Verification failed:", err.message);
        res.clearCookie('auth_token');
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

const isAuthorized = (requiredRole) => {
    return async (req, res, next) => {
        if (!req.cookies.auth_token) {
            return res.status(401).json({ message: "Authentication required for Authorization" });
        }

        try {
            const decoded = jwt.verify(req.cookies.auth_token, JWT_SECRET);
            const userId = decoded.userId;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.roles.includes(requiredRole)) {
                next();
            } else {
                return res.status(403).json({ error: "Forbidden", message: `Access denied. Requires '${requiredRole}' role.`});
            }
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    } 
};

module.exports = {
    isAuthenticated,
    isAuthorized
}