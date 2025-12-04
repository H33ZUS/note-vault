const Joi = require('joi');

// REQUEST SCHEMAS
const userCreateRequestSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    roles: Joi.array().items(Joi.string().valid('student', 'teacher', 'admin')).default(['student']),
}).unknown(false);

const userLoginRequestSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
}).unknown(false);

const userUpdateRoleRequestSchema = Joi.object({
    roles: Joi.array().items(Joi.string().valid('student', 'teacher', 'admin')).min(1).required()
}).unknown(false);

const userPutRequestSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    roles: Joi.forbidden()
}).unknown(false);

const userPatchRequestSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    roles: Joi.forbidden()
}).min(1).unknown(false);

// RESPONSE SCHEMAS
const linkSchema = Joi.object({
    rel: Joi.string().required(),
    method: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').required(),
    href: Joi.string().required()
})

const userResponseSchema = Joi.object({
    _id: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().required(),
    roles: Joi.array().items(Joi.string()).required()
}).unknown(false);

const userCreateResponseSchema = userResponseSchema.keys({
    links: Joi.array().items(linkSchema).required()
}).unknown(false);

module.exports = { 
    userCreateRequestSchema,
    userLoginRequestSchema,
    userUpdateRoleRequestSchema,
    userPatchRequestSchema,
    userPutRequestSchema,
    userResponseSchema,
    userCreateResponseSchema
 };