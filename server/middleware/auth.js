const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (req, res, next) => {
    // ONLY FOR TESTING
    if (!req.session || !req.session.userId) {
        const TEMP_USER_ID = "692984f7ce1510ed7a64bbc1";
        req.session.userId = new ObjectId(TEMP_USER_ID);
        console.warn("Using temp userId");
        return next();
    }

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