const express = require("express"); 
const Subject = require("../models/subject.js");
const NoteFile = require("../models/noteFile.js");
const User = require("../models/user.js");
const Enrollment = require("../models/enrollment.js");
const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");
const { validateRequest } = require("../middleware/requestValidator.js");
const { validateResponse } = require("../middleware/responseValidator.js");
const val = require("../validations/subjectValidation.js");
const router = express.Router();

router.post("/", isAuthenticated, isAuthorized("teacher"), validateRequest(val.subjectRequest), async(req, res, next) => {

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

        const subjectData = subject.toObject();
        delete subjectData.__v;

        if (subjectData.createdBy && subjectData._id) {
            subjectData.createdBy = subjectData.createdBy.toString();
            subjectData._id = subjectData._id.toString();
        }

        const noteFileData = defaultNoteFile.toObject();
        delete noteFileData.__v;

        if (noteFileData._id && noteFileData.subjectId) {
            noteFileData._id = noteFileData._id.toString();
            noteFileData.subjectId = noteFileData.subjectId.toString();
        }

        finalData = {
            subject: subjectData,
            defaultNoteFile: noteFileData
        }

        res.locals.data = finalData;

        next();
    } catch (err) {
        res.status(400).json({error: err.message}); // bad request
    }
}, validateResponse(val.subjectCreateResponse), (req, res) => {
    res.status(201).json(res.locals.data);
});

// get all
router.get("/", isAuthenticated, async(req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const filterStatus = req.query.filter ? req.query.filter.toLowerCase() : "all";
    try {
        let query = {};
        const userId = req.user._id;

        if (filterStatus === "enrolled" || filterStatus === "available") {
            const enrollments = await Enrollment.find({ userId }).select("subjectId");
            const enrolledIds = enrollments.map(e => e.subjectId);

            if (filterStatus === "enrolled") {
                query = { _id: { $in: enrolledIds } };
            } else {
                query = { _id: { $nin: enrolledIds } };
            }
        }

        const subjects = await Subject.find(query).select("-__v").collation({ locale: "en", strength: 1 }).sort({ title: 1 });

        const finalData = subjects.map(subject => {
            const subjectObj = subject.toObject();

            if (subjectObj._id && subjectObj.createdBy) {
                subjectObj._id = subjectObj._id.toString();
                subjectObj.createdBy = subjectObj.createdBy.toString();
            }

            return subjectObj;
        });

        res.locals.data = finalData;
        next();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}, validateResponse(val.subjectArrayResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

// get one
router.get("/:id", async(req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id).select("-__v");

        const subjectObj = subject.toObject();

        if (subjectObj._id && subjectObj.createdBy) {
            subjectObj._id = subjectObj._id.toString();
            subjectObj.createdBy = subjectObj.createdBy.toString();
        }
        
        res.locals.data = subjectObj;
        next();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}, validateResponse(val.subjectResponse), (req, res) => {
    res.status(200).json(res.locals.data);
});

router.patch("/:id", isAuthenticated, isAuthorized("teacher"), validateRequest(val.subjectRequest), async(req, res, next) => {

    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, runValidators: true}).select("-__v");

        subjectObj = subject.toObject();

        if (subjectObj._id && subjectObj.createdBy) {
            subjectObj._id = subjectObj._id.toString();
            subjectObj.createdBy = subjectObj.createdBy.toString();
        }

        res.locals.data = subjectObj;
        next(); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}, validateResponse(val.subjectResponse), (req, res) => {
    res.status(200).json(res.locals.data);
});

router.put("/:id", isAuthenticated, isAuthorized("teacher"), validateRequest(val.subjectRequest), async(req, res, next) => {
    try {
        const updated = await Subject.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, runValidators: true}).select("-__v");

        if (!updated) {
            return res.status(404).json({error: "Subject not found"});
        }

        subjectObj = updated.toObject();

        if (subjectObj._id && subjectObj.createdBy) {
            subjectObj._id = subjectObj._id.toString();
            subjectObj.createdBy = subjectObj.createdBy.toString();
        }

        res.locals.data = subjectObj;
        next();
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}, validateResponse(val.subjectResponse), (req, res) => {
    res.status(200).json(res.locals.data);
});
    
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