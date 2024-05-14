import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import { User } from "../models/userModel.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL } = process.env;

const googleParams = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/api/users/google/callback`,
  passReqToCallback: true,
};

const googleCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    const { email, displayName } = profile;
    const user = await User.findOne({ email });
    if (user) {
      return done(null, user);
    }
    const password = await bcrypt.hash(v4(), 10);
    const newUser = await User.create({ email, password, name: displayName });
    done(null, newUser);
  } catch (error) {
    done(error, false);
  }
};

const googleStrategy = new GoogleStrategy(googleParams, googleCallback);

passport.use("google", googleStrategy);

export default passport;
