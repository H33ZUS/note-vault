const Joi = require('joi');

const validateResponse = (schema) => (req, res, next) => {
    const dataToValidate = res.locals.data;
    console.log("response called");

    if (!dataToValidate) {
        console.warn("Response Validator: No data found in res.locals.data");
        return next();
    }

    const validationSchema = Array.isArray(dataToValidate)
        ? Joi.array().items(schema)
        : schema;

    const { error, value } = validationSchema.validate(dataToValidate);

    if (error) {
        console.error("Response Validation Failed:", error.details);

        return res.status(500).json({
            message: "Internal server error: Response structure is invalid",
            details: error.details
        });
    }

    res.locals.data = value;
    next();
};

module.exports = { validateResponse };