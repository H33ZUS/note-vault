const express = require("express");
var User = require("../models/user.js");
var Subject = require("../models/subject.js");

const router = express.Router();

router.post("/subjects/:id/enroll", async(req, res) =>{
    try{
        const subjectId = req.params.id;
        const userId = req.body.userId;

        await User.findByIdAndUpdate(userId, {
            $addToSet: {enrolledIn: subjectId}
        });

        await Subject.findByIdAndUpdate(subjectId, {
            $addToSet: {enrolled: userId}
        });
    } catch(err){
        res.status(400).json({error: err.message});
    }
})

module.exports = router;
