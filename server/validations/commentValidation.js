const Joi = require("joi");

// REQUEST SCHEMAS
const commentRequestSchema = Joi.object({
    comment: Joi.string().min(1).max(200).required(),
    commentedOnNote: Joi.any().optional(),
    commentedOnComment: Joi.any().optional()
}).unknown(false);

const commentLikesRequestSchema = Joi.object({
    like: Joi.bool().required(),
    dislike: Joi.bool().required()
}).unknown(false);

// RESPONSE SCHEMAS
const commentResponseSchema = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    dislikes: Joi.number().required(),
    likes: Joi.number().required(),
    createdBy: Joi.string().hex().length(24).required(),
    comment: Joi.string().min(1).max(200).required(),
    commentedOnNote: Joi.string().hex().length(24).optional().allow(null),
    commentedOnComment: Joi.string().hex().length(24).optional().allow(null),
    deleted: Joi.bool().required()
}).unknown(false);

const commentTreeSchema = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    dislikes: Joi.number().required(),
    likes: Joi.number().required(),
    createdBy: Joi.object({
        _id: Joi.string().hex().length(24).required(),
        username: Joi.string().required()
    }),
    comment: Joi.string().min(1).max(200).required(),
    commentedOnNote: Joi.string().hex().length(24).optional().allow(null),
    commentedOnComment: Joi.string().hex().length(24).optional().allow(null),
    deleted: Joi.bool().required(),
    replies: Joi.array().items(Joi.link('#commentTreeSchema')).optional(),
    comments: Joi.array().items(Joi.link('#commentTreeSchema')).optional()
}).unknown(true).id('commentTreeSchema');

const commentTreeResponseSchema = Joi.array().items(commentTreeSchema).required();

module.exports = {
    commentRequestSchema,
    commentLikesRequestSchema,
    commentResponseSchema,
    commentTreeSchema,
    commentTreeResponseSchema
}