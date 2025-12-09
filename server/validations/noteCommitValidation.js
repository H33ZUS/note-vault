const Joi = require("joi");

// REQUEST SCHEMAS
const noteCommitRequestSchema = Joi.object({
    note: Joi.string().min(1).required(),
    topic: Joi.string().min(5).max(100).required()
}).unknown(false);

const noteCommitPatchRequestSchema = Joi.object({
    note: Joi.string().min(1).required()
}).unknown(false);

const noteCommitLikesRequestSchema = Joi.object({
    like: Joi.bool().required(),
    dislike: Joi.bool().required()
}).unknown(false);

// RESPONSE SCHEMAS
const noteCommitResponseSchema = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    likes: Joi.number().required(),
    dislikes: Joi.number().required(),
    createdBy: Joi.string().hex().length(24).required(),
    note: Joi.string().min(1).required(),
    topic: Joi.string().min(5).max(100).required(),
    noteFileId: Joi.string().hex().length(24).required(),
    createdAt: Joi.date().required()
}).unknown(false);

const noteCommitArrayResponseSchema = Joi.array().items(noteCommitResponseSchema).required();

module.exports = {
    noteCommitRequestSchema,
    noteCommitPatchRequestSchema,
    noteCommitResponseSchema,
    noteCommitArrayResponseSchema
}