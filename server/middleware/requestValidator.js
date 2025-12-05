const Joi = require('joi');

const validateRequest = (schema, source = 'body') => (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        allowUnknown: false
    });

    if (error) {
        const details = error.details.map(err => {
            return {
                field: err.path.join('.'),
                message: err.message.replace(/"/g, ''),
                type: err.type
            }
        });

        return res.status(400).json({
            message: `Request validation failed in ${source} `,
            details: details
        })
    }

    req[source] = value;
    next();
};

module.exports = { validateRequest };