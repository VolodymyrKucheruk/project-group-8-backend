import express from "express";
import validateBody from "../helpers/validateBody.js";
import {
  signUpSchema,
  signInSchema,
  emailSchema,
  refreshSchema,
  updateUserInfoSchema,
} from "../models/usersSchema.js";
import { authenticate } from "../helpers/authenticate.js";
import { upload } from "../helpers/upload.js";
import {
  signUp,
  signIn,
  signOut,
  current,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
  refresh,
  updateUserInfo,
  googleAuth,
} from "../controllers/usersControllers.js";
import passport from "../helpers/google-authenticate.js";

export const router = express.Router();

router.get("/current", authenticate, current);
router.post("/signUp", validateBody(signUpSchema), signUp);
router.get("/verify/:verificationToken", verifyEmail);
router.post("/verify", validateBody(emailSchema), resendVerifyEmail);
router.post("/signIn", validateBody(signInSchema), signIn);
router.post("/signOut", authenticate, signOut);
router.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.patch(
  "/update",
  authenticate,
  validateBody(updateUserInfoSchema),
  updateUserInfo
);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }, googleAuth)
);
