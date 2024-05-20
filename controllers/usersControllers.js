import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import gravatar from "gravatar";
import { v2 as cloudinary } from "cloudinary";
import { sendEmail } from "../helpers/sendEmail.js";
import { v4 } from "uuid";

dotenv.config();

const {
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  MAILTRAP_USER,
  MAILTRAP_HOST,
  FRONTEND_URL,
} = process.env;

export const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const atIndex = email.indexOf("@");
    const name = email.substring(0, atIndex);
    const user = await User.findOne({ email });

    if (user) throw HttpError(409, "Email already in use");

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { protocol: "https" });

    let cloudinaryAvatarURL;
    const cloudinaryResponse = await cloudinary.uploader.upload(avatarURL);
    cloudinaryAvatarURL = cloudinaryResponse.secure_url;

    const verificationToken = v4();
    const dailyWaterNorma = 1500;
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashPassword,
      avatarURL: cloudinaryAvatarURL,
      dailyWaterNorma,
      verificationToken,
    });

    const payload = {
      id: newUser._id,
      dailyWaterNorma: newUser.dailyWaterNorma,
    };

    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
      expiresIn: "7d",
    });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: "10d",
    });

    await User.findByIdAndUpdate(newUser._id, { accessToken, refreshToken });

    const verifyEmail = {
      from: MAILTRAP_USER,
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${MAILTRAP_HOST}/users/verify/${verificationToken}">Click verify email</a>`,
    };
    await sendEmail(verifyEmail);

    res.status(201).json({
      email: newUser.email,
      water: dailyWaterNorma,
      avatarURL: cloudinaryAvatarURL,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw HttpError(401, "Email or password is wrong");

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) throw HttpError(401, "Email or password is wrong");

    const payload = {
      id: user._id,
      dailyWaterNorma: user.dailyWaterNorma,
    };
    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
      expiresIn: "7d",
    });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: "10d",
    });

    await User.findOneAndUpdate(user._id, { accessToken, refreshToken });

    res.json({
      name: user.name,
      email: user.email,
      avatar: user.avatarURL,
      water: user.dailyWaterNorma,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { _id } = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const user = await User.findOne({ refreshToken });

    if (!user) {
      throw HttpError(403, "Token invalid");
    }

    const payload = { _id };
    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
      expiresIn: "7d",
    });
    const newRefreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: "10d",
    });

    await User.findByIdAndUpdate(user._id, {
      accessToken,
      refreshToken: newRefreshToken,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findOneAndUpdate(_id, {
      accessToken: "",
      refreshToken: "",
    });
    if (!user) throw HttpError(401);

    throw HttpError(204, "signOUt success");
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email }).select(
      "_id name dailyWaterNorma avatarURL gender weight activeSportTime"
    );
    if (!user) throw HttpError(401);
    res.json(user);
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
    const result = await cloudinary.uploader.upload(req.file.path);
    const avatarURL = result.secure_url;
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserInfo = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      name,
      email,
      gender,
      weight,
      activeSportTime,
      dailyWaterNorma,
      avatarURL,
    } = req.body;

    const updatedFields = {
      name: name || user.name,
      email: email || user.email,
      gender: gender || user.gender,
      weight: weight || user.weight,
      activeSportTime: activeSportTime || user.activeSportTime,
      dailyWaterNorma: dailyWaterNorma || user.dailyWaterNorma,
      avatarURL: avatarURL || user.avatarURL,
    };

    const updatedUser = await User.findByIdAndUpdate(user._id, updatedFields, {
      new: true,
    }).select(
      "_id name dailyWaterNorma avatarURL gender weight activeSportTime"
    );

    res.json(updatedUser);
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

export const googleAuth = async (req, res) => {
  const { _id: id } = req.user;
  const payload = {
    id,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: "7d" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: "10d",
  });
  await User.findByIdAndUpdate(id, { accessToken, refreshToken });

  res.redirect(
    `${FRONTEND_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );
};
