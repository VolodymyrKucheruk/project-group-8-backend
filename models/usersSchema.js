import Joi from "joi";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.pattern.base": "Email must be a valid email address",
  }),
  password: Joi.string().required(),
});

export const emailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.pattern.base": "Email must be a valid email address",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.pattern.base": "Email must be a valid email address",
  }),
  password: Joi.string().required(),
});
export const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});
