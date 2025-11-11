const express = require("express");
import Subject from "../models/subject.js";

const router = express.Router();

router.post("/", async(req, res) => {

    try {
        const subject = new Subject(req.body);
        await subject.save();
        res.status(201).json(subject); // created
    } catch (err) {
        res.status(400).json({error: err.message}); // bad request
    }
});

export default router;