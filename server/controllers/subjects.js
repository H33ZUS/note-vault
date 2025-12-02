const express = require("express");
const mongoose = require("mongoose");
const Subject = require("../models/subject.js");
const NoteFile = require("../models/noteFile.js");
const User = require("../models/user.js");
const isAuthenticated = require("../middleware/auth");
const Enrollment = require("../models/enrollment.js");

const router = express.Router();

router.post("/", async(req, res) => {

    try {
        const userId = req.session.userId
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
router.get("/available", async(req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    try {
        const userId = req.session.userId;

        const userCheck = await User.findById(userId);
        if (!userCheck) {
            return res.status(404).json({ message: "User not found" });
        }

        const enrollments = await Enrollment.find({ userId: userId }).select("subjectId");
        const enrolledIds = enrollments.map(e => e.subjectId);

        const available = await Subject.find({ _id: { $nin: enrolledIds }});

        res.json(available);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// get subjects user is enrolled in
router.get("/enrolled", async(req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    try {
        const userId = req.session.userId;

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


router.patch("/:id", async(req, res) => {
    try {
        const subjects = await Subject.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, runValidators: true});
        res.json(subjects);  
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.put("/:id", async(req, res) => {
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
    

router.delete("/:id", async(req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id)
        res.status(204).send();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.delete("/", async(req, res) => {
    try {
        const subjects = await Subject.deleteMany({});
        res.status(204).send();
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

module.exports = router;