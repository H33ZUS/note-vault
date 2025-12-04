const Joi = require("joi");

// RESPONSE SCHEMAS
const noteFileResponseSchema = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    subjectId: Joi.string().hex().length(24).required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required()
}).unknown(false);

module.exports = {
    noteFileResponseSchema
};