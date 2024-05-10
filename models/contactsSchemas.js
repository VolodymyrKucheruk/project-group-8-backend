import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().min(7).required(),
  phone: Joi.string().min(9).required(),
  favorite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().min(7),
  phone: Joi.string().min(9),
  favorite: Joi.boolean(),
});