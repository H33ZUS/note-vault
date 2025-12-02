const express = require("express");
var Subject = require("../models/subject.js");
var Enrollment = require("../models/enrollment.js");
const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");

const router = express.Router();

// ENROLL IN SUBJECT
router.post("/:id/enroll", isAuthenticated, async(req, res) => {
    const subjectId = req.params.id;
    const userId = req.user._id;

    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({message: "Subject not found"});
        }

        const newEnrollment = new Enrollment({
            userId: userId,
            subjectId: subjectId
        });

        await newEnrollment.save();

        res.status(201).json({
            message: "Successfully enrolled",
            enrollment: newEnrollment
        }); 
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({message: "You are already enrolled in this subject"});
        }
        res.status(400).json({message: err.message});
    }
});

// DROP OUT OF SUBJECT
router.post("/:id/unenroll", isAuthenticated, async(req, res) => {
    const subjectId = req.params.id;
    const userId = req.user._id;

    try {
        const result = await Enrollment.findOneAndDelete({
            subjectId: subjectId,
            userId: userId
        });

        if (!result) {
            return res.status(404).json({message: "Enrollment not found"});
        }

        res.status(200).json({message: "Successfully unenrolled"});
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

// GET ALL ENROLLMENTS
router.get("/", async(req, res) => {
    try {
        const enrollment = await Enrollment.find();
        res.json(enrollment); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

module.exports = router;
