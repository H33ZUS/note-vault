module.exports = (req, res, next) => {
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