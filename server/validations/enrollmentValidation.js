const Joi = require("joi");

const enrollmentResponseSchema = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    userId: Joi.string().hex().length(24).required(),
    subjectId: Joi.string().hex().length(24).required(),
    enrolledAt: Joi.date().required()
}).unknown(false);

const enrollmentArrayResponseSchema = Joi.array().items(enrollmentResponseSchema).required();

module.exports = {
    enrollmentResponseSchema,
    enrollmentArrayResponseSchema
}