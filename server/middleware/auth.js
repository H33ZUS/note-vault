const User = require("../models/user");

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        console.log("Authentication failed: No userId in session.");
        return res.status(401).json({
            error: "Unauthorized",
            messsage: "You must be logged in to access this resource."
        })
    }
};

const isAuthorized = (requiredRole) => {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Authentication required for Authorization" });
        }

        try {
            const user = await User.findById(req.session.userId);

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