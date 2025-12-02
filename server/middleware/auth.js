const User = require("../models/user");

const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No authentication token provided." });
    }

    try {
        const user = await User.findById(token);

        if (!user) {
            res.clearCookie("auth_token");
            return res.status(401).json({ error: "User not found." });
        }

        req.user = user;
        
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.clearCookie('auth_token');
        return res.status(401).json({ error: "Invalid token format." });
    }
};

const isAuthorized = (requiredRole) => {
    return async (req, res, next) => {
        if (!req.cookies.auth_token) {
            return res.status(401).json({ message: "Authentication required for Authorization" });
        }

        try {
            const user = await User.findById(req.cookies.auth_token);

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