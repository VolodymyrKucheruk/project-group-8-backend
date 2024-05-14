import Joi from "joi";

export const createWaterSchema = Joi.object({
  amountDose: Joi.number().min(2).required(),
  timeDose: Joi.string().min(5).required(),
  dateDose: Joi.string(),
});

export const updateWaterSchema = Joi.object({
  amountDose: Joi.number().min(2),
  timeDose: Joi.string().min(5),
});
