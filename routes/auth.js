import express from "express";
import validateBody from "../helpers/validateBody.js";
import {
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
  emailSchema,
} from "../models/usersSchema.js";
import { authenticate } from "../helpers/authenticate.js";
import { upload } from "../helpers/upload.js";
import {
  register,
  login,
  logout,
  current,
  updateSubscription,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
} from "../controllers/usersControllers.js";

export const router = express.Router();

router.get("/current", authenticate, current);
router.post("/register", validateBody(registerSchema), register);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/verify", validateBody(emailSchema), resendVerifyEmail);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", authenticate, logout);
router.patch(
  "/subscription",
  authenticate,
  validateBody(updateSubscriptionSchema),
  updateSubscription
);
router.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);
