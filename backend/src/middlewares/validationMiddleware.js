const Joi = require('joi');

const validateService = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).required(),
        price: Joi.number().positive().max(100000).required(),
        category: Joi.string().required(),
        location: Joi.string().required(),
        service_type: Joi.string().valid('offering', 'seeking').required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateServiceQuery = (req, res, next) => {
    const schema = Joi.object({
        search: Joi.string().allow('', null),
        category: Joi.string().allow('', null),
        location: Joi.string().allow('', null),
        minPrice: Joi.number().min(0).allow('', null),
        maxPrice: Joi.number().min(0).allow('', null),
        type: Joi.string().valid('offering', 'seeking', '', null),
        page: Joi.number().min(1).allow('', null),
        limit: Joi.number().min(1).max(100).allow('', null)
    });

    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = { validateService, validateServiceQuery };