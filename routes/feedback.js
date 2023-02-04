import express from "express";
import { Feedback } from "../schemas/index.js";
import sgMail from "@sendgrid/mail";
import dbConnect from "../utils/dbConnect.js";
import "dotenv/config";

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_KEY);

router.post("/", dbConnect, async (req, res) => {
  const { subject, message, anonymous, race, participant } = req.body;
  const { user_id, email, first_name, last_name } = participant;
  console.log("anon", anonymous, "race", race);

  //create feedback in db
  const feedback = new Feedback({ user_id, subject, message });
  await feedback.save();

  res.json(feedback);

  //send email
  const replyTo =
    anonymous || (!email || !first_name)
      ? ""
      : `<p><b>From:</b> ${first_name} ${last_name}</p>` +
        (email &&
        `<p><b>Reply to:</b> <a href="mailto:${email}">${email}</a></p>`);
  
  const msg = {
    // to: "teamp@playmakersfitnessfoundation.org",
    to: "dj@playmakers.com",

    from: "wecare@playmakers.com",
    subject: `${race.name} Feedback - ${subject}`,
    text: message,
    html: `<p>${message}</p>
    ${replyTo}`,
  };
  sgMail.send(msg);
});

export default router;
