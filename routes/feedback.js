import express from "express";
import mongoose from "mongoose";
import { Feedback } from "../schemas/index.js";
import sgMail from "@sendgrid/mail";
import "dotenv/config";

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_KEY);

router.post("/", async (req, res) => {
  const { subject, message, anonymous, race, participant } = req.body;
  const { user_id, email, first_name, last_name } = participant;
  console.log("race", race);
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const feedback = new Feedback({ user_id, subject, message });
  await feedback.save();
  res.json(feedback);
  const replyTo = anonymous
    ? ""
    : `<p><b>From:</b> ${first_name} ${last_name}</p>
    <p><b>Reply to:</b> <a href="mailto:${email}">${email}</a></p>`;
  const msg = {
    to: "teamp@playmakersfitnessfoundation.org",
    from: "wecare@playmakers.com",
    subject: `${race.name} Feedback - ${subject}`,
    text: message,
    html: `<p>${message}</p>
    ${replyTo}`,
  };
  sgMail.send(msg);
});

export default router;
