const { noteFileResponseSchema } = require('./noteFileValidation');
const Joi = require('joi');

// REQUEST SCHEMAS
const subjectRequest = Joi.object({
    title: Joi.string().min(3).max(100).required()
}).unknown(false);

//RESPONSE SCHEMAS
const subjectResponse = Joi.object({
    title: Joi.string().required(),
    createdBy: Joi.string().hex().length(24).required(),
    _id: Joi.string().hex().length(24).required(),
    createdAt: Joi.date().required()
}).unknown(false);

const subjectCreateResponse = Joi.object({
    subject: subjectResponse,
    defaultNoteFile: noteFileResponseSchema
}).unknown(false);

module.exports = {
    subjectRequest,
    subjectResponse,
    subjectCreateResponse
};