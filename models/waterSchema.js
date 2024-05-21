import Joi from "joi";
import { timeRegex } from "./regex.js";


export const createWaterSchema = Joi.object({
  amountDose: Joi.number().min(2).required(),
  timeDose: Joi.string().pattern(timeRegex).min(5).required(),
  dateDose: Joi.string(),
});

export const updateWaterSchema = Joi.object({
  amountDose: Joi.number().min(2),
  timeDose: Joi.string().min(5),
});
