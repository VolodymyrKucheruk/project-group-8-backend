import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { MAILTRAP_PASSWORD } = process.env;

const email = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  // auth: {
  //   user: "431b14cc250a3e",
  //   pass: MAILTRAP_PASSWORD,
  // },
  auth: {
    user: "330d7d4216cee7",
    pass: "0eef049e235ae0",
  },
};
const transport = nodemailer.createTransport(email);

export const sendEmail = async (data) => {
  const email = { ...data, from: "ekonomistleshoz@gmail.com" };
  try {
    await transport.sendMail(email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
