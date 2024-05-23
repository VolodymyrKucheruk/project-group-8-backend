import { model, Schema } from "mongoose";
import { emailRegexp } from "./regex.js"


const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
    name: {
      type: String,
      required: false,
    },
    dailyWaterNorma: {
      type: Number,
      default: 1500,
    },
    weight: {
      type: Number,
      required: false,
    },
    gender: {
      type: String,
      enum: ["man", "woman"],
      required: false,
    },
    activeSportTime: {
      type: Number,
      required: false,
    },
    avatarURL: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },

  { versionKey: false, timestamps: true }
);

export const User = model("User", userSchema);
