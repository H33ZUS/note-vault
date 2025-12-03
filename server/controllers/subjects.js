const express = require("express"); 
const Subject = require("../models/subject.js");
const NoteFile = require("../models/noteFile.js");
const User = require("../models/user.js");
const Enrollment = require("../models/enrollment.js");
const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");
const router = express.Router();

router.post("/", isAuthenticated, isAuthorized("teacher"), async(req, res) => {

    try {
        const userId = req.user._id;
        const subject = await Subject.create({
            title: req.body.title,
            createdBy: userId
        });

        const defaultNoteFile = new NoteFile({ // noteFile created when subject is created
            title: `Untitled Note for ${subject.name || subject._id}`,
            subjectId: subject._id
        });
        await defaultNoteFile.save();
        res.status(201).json({subject: subject, defaultNoteFile: defaultNoteFile}); // created
    } catch (err) {
        res.status(400).json({error: err.message}); // bad request
    }
});

// get all
router.get("/", async(req, res) => {
    try {
        const subjects = await Subject.find();
        res.json(subjects); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

// get subjects user is not enrolled in
router.get("/available", isAuthenticated, async(req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const {sort} = req.query;
    try {
        const userId = req.user._id;

        const userCheck = await User.findById(userId);
        if (!userCheck) {
            return res.status(404).json({ message: "User not found" });
        }

        const enrollments = await Enrollment.find({ userId: userId }).select("subjectId");
        const enrolledIds = enrollments.map(e => e.subjectId);

        const available = await Subject.find(
            { _id: { $nin: enrolledIds }}, 
            null, { collation: { locale: "en", strength: 1 }}).sort({ title: 1 }); // sort alphabetically

        res.json(available);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// get subjects user is enrolled in
router.get("/enrolled", isAuthenticated, async(req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    try {
        const userId = req.user._id

        const enrollments = await Enrollment.find({ userId}).select("subjectId");
        const enrolledIds = enrollments.map(e => e.subjectId);

        const subjects = await Subject.find({ _id: { $in: enrolledIds } });
        res.json(subjects);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// get one
router.get("/:id", async(req, res) => {
    try {
        const subjects = await Subject.findById(req.params.id);
        res.json(subjects);
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.patch("/:id", isAuthenticated, isAuthorized("teacher"), async(req, res) => {

    try {
        const subjects = await Subject.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, runValidators: true});
        res.json(subjects);  
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.put("/:id", isAuthenticated, isAuthorized("teacher"), async(req, res) => {
    try {
        const requiredFields = ["title", "noteFile", "quizFile"];
        const missing = requiredFields.filter(f => !(f in req.body)); // checks for missing fields in requiredFields

        if (missing.length > 0) {
            return res.status(400).json({error: `PUT requires all fields: Missing: ${missing.join(", ")}`});
        }
        const updated = await Subject.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, runValidators: true});

        if (!updated) {
            return res.status(404).json({error: "Subject not found"});
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});
    

// WE ALSO NEED TO DELETE THE NOTE FILE WHEN DELETING A SUBJECT
router.delete("/:id", isAuthenticated, isAuthorized("teacher"), async(req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        const subjectResult = await subject.deleteOne();

        if (subjectResult == null) {
            return res.status(404).json({ message: "Subject does not exist." });
        }

        res.status(200).json({ message: `Subject deleted successfully.` });
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.delete("/", isAuthenticated, isAuthorized("teacher"), async(req, res) => {
    try {
        const subjects = await Subject.find({});

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ message: "There exists no subject" });
        }

        let deletedCount = 0;

        for (const subject of subjects) {
            await subject.deleteOne();
            deletedCount++;
        }

        res.status(200).json({ message: `${deletedCount} subjects deleted successfully.` });
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

module.exports = router;