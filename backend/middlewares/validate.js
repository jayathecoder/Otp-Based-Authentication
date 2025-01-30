const Joi = require('joi');

const loginvalidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().max(20).min(8).required()
    })
    const error = schema.validate(req.body);
    if(error){
        return res.status(400).json({error: 'please enter valid email or password'});
    }
    next();
}

const registervalidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().max(20).min(8).required(),
        company: Joi.string().required(),
        age: Joi.string().required(),
        dob: Joi.string().required()
    })
    const error = schema.validate(req.body);
    if(error){
        return res.status(400).json({error: 'please enter valid details'});
    }
    next();
}
module.exports = {loginvalidation, registervalidation};
