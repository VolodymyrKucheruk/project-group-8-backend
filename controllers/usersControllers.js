import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import gravatar from "gravatar";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Jimp from "jimp";
import { sendEmail } from "../helpers/sendEmail.js";
import { v4 } from "uuid";

dotenv.config();

const { SECRET_KEY, MAILTRAP_USER, MAILTRAP_HOST } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avatarsPath = path.join(__dirname, "../", "public", "avatars");

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) throw HttpError(409, "Email already in use");

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = v4();
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });
    const verifyEmail = {
      from: MAILTRAP_USER,
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${MAILTRAP_HOST}/users/verify/${verificationToken}">Click verify email</a>`,
    };
    await sendEmail(verifyEmail);

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(404, "Invalid or expired verification token");
    }
    if (user.verify) {
      throw HttpError(409, "Email already verified");
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).json({
      message: "Email verification successful",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(400, "missing required field email");
    }
    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${MAILTRAP_HOST}/users/verify/${user.verificationToken}">Click verify email</a>`,
    };
    await sendEmail(verifyEmail);
    res.json({
      message: "Verify email send success",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw HttpError(401, "Email or password is wrong");

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) throw HttpError(401, "Email or password is wrong");

    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "10d" });
    await User.findOneAndUpdate(user._id, { token });

    res.json({
      token,
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findOneAndUpdate(_id, { token: "" });
    if (!user) throw HttpError(401);

    throw HttpError(204);
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    const user = await User.findOne({ email });
    if (!user) throw HttpError(401);

    res.json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};
export const updateSubscription = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const { _id: userId } = req.user;
    const validSubscriptions = ["starter", "pro", "business"];

    if (!validSubscriptions.includes(subscription)) {
      throw HttpError(400, "Invalid subscription type");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true }
    );

    if (!updatedUser) {
      throw HttpError(404, "User not found");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.user) {
      throw HttpError(401, "Not authorized");
    }
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const fileName = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsPath, fileName);

    await fs.rename(tempUpload, resultUpload);

    const image = await Jimp.read(resultUpload);
    await image.resize(250, 250).writeAsync(resultUpload);

    const avatarURL = path.join("avatars", fileName);
    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};
