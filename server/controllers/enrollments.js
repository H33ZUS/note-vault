const express = require("express");
var Subject = require("../models/subject.js");
var Enrollment = require("../models/enrollment.js");
const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");
const { validateResponse } = require("../middleware/responseValidator.js");
const val = require("../validations/enrollmentValidation.js");

const router = express.Router();

// ENROLL IN SUBJECT
router.post("/:id/enroll", isAuthenticated, async(req, res, next) => {
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

        const enrollmentObj = newEnrollment.toObject();
        delete enrollmentObj.__v;

        if (enrollmentObj._id) {
            enrollmentObj.userId = enrollmentObj.userId.toString();
            enrollmentObj.subjectId = enrollmentObj.subjectId.toString();
            enrollmentObj._id = enrollmentObj._id.toString();
        }

        res.locals.data = enrollmentObj;
        next();
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({message: "You are already enrolled in this subject"});
        }
        res.status(400).json({message: err.message});
    }
}, validateResponse(val.enrollmentResponseSchema), (req, res) => {
    res.status(201).json(res.locals.data);
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
router.get("/", async(req, res, next) => {
    try {
        const enrollments = await Enrollment.find().select("-__v");

        const finalData = enrollments.map(enrollment => {
            const enrollmentObj = enrollment.toObject();

            if (enrollmentObj._id) {
                enrollmentObj._id = enrollmentObj._id.toString();
                enrollmentObj.userId = enrollmentObj.userId.toString();
                enrollmentObj.subjectId = enrollmentObj.subjectId.toString();
            }

            return enrollmentObj;
        });

        res.locals.data = finalData;
        next();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}, validateResponse(val.enrollmentArrayResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

module.exports = router;
