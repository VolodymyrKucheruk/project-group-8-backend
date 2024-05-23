import express from "express";
import {
  createWater,
  updateWater,
  deleteWater,
  getListMonthByDay,
  getListDay,
  getListDate,
} from "../controllers/waterControllers.js";
import validateBody from "../helpers/validateBody.js";
import { createWaterSchema, updateWaterSchema } from "../models/waterSchema.js";
import isValidId from "../helpers/isValidId.js";
import { authenticate } from "../helpers/authenticate.js";

const waterRouter = express.Router();

waterRouter.post(
  "/add",
  authenticate,
  validateBody(createWaterSchema),
  createWater
);

waterRouter.patch(
  "/:id",
  authenticate,
  isValidId("id"),
  validateBody(updateWaterSchema),
  updateWater
);

waterRouter.delete("/:id", authenticate, isValidId("id"), deleteWater);

waterRouter.get("/day", authenticate, getListDay);
waterRouter.get("/:date", authenticate, getListDate);

waterRouter.get("/monthly/:date", authenticate, getListMonthByDay);

export default waterRouter;
