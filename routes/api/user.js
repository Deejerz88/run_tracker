import axios from "axios";
import express from "express";
import { Participant } from "../../schemas/index.js";
import sgMail from "@sendgrid/mail";
import Pusher from "pusher";
import "dotenv/config";
import mongoose from "mongoose";

const pusher = new Pusher({
  appId: process.env.REACT_APP_PUSHER_ID,
  key: process.env.REACT_APP_PUSHER_KEY,
  secret: process.env.REACT_APP_PUSHER_SECRET,
  cluster: "us2",
  useTLS: true,
});

sgMail.setApiKey(process.env.SENDGRID_KEY);

const router = express.Router();

router.post("/", async (req, res) => {
  const { first_name, last_name, email, phone, change_password } = req.body;
  console.log("email", email);
  const user = await Participant.findOne({ email });
  console.log("user", user);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.first_name = first_name;
  user.last_name = last_name;
  user.phone = phone;
  change_password && (user.password = change_password);
  user.save();
  res.json({ user });
});

router.post("/signup", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let { username, email, password } = req.body;
  console.log("email", email, "password", password, "username", username);
  let user;
  user = await Participant.findOne({ email});
  console.log("user", user);
  if (user) return res.status(409).json({ error: "User already exists" });

  let { data: participants } = await axios.get(
    "https://runsignup.com/rest/club/2190/members",
    {
      params: {
        api_key: process.env.RSU_KEY,
        api_secret: process.env.RSU_SECRET,
        format: "json",
        results_per_page: 2500,
      },
    }
  );

  console.log("participants", participants.club_members[0]);
  // return res.json(participants.club_members[0]);
  let participant =
    participants.club_members.find(
      (participant) => participant.user.email === email
    ) || {};
  console.log("participant", participant)
  if (!participant.user) {
    const { data: partnerParticipants } = await axios.get(
      "https://runsignup.com/rest/users",
      {
        params: {
          api_key: process.env.RSU_KEY,
          api_secret: process.env.RSU_SECRET,
          format: "json",
          results_per_page: 2500,
        },
      }
    );
    console.log("partnerParticipants", partnerParticipants);

    participant =
      participants.users.find(
        (participant) => participant.user.email === email
      ) || {};
    console.log("participant1", participant);
  }
  if (!participant.user)
    participant.user = { user_id: Math.floor(Math.random() * 1000000) };
  console.log("participant2", participant);
  let newUser = {};
  try {
    newUser = await Participant.create({
      ...participant.user,
      username,
      email,
      password,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(409).json({ error: "Username already in use" });
  }
  console.log("newUser", newUser);

  req.session.save(() => {
    req.session.user = newUser;
    req.session.loggedIn = true;
    res.json({ user: newUser, message: "You are now logged in!" });
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("username", username, "password", password);

  const user = await Participant.findOne({ username });
  console.log("user", user);

  if (!user)
    return res
      .status(401)
      .json({ error: "Incorrect username or password. Please try again!" });

  const validPassword = Participant.checkPassword(password, user.password);

  if (!validPassword)
    return res
      .status(401)
      .json({ error: "Incorrect username or password. Please try again!" });

  req.session.save(() => {
    req.session.user = user;
    req.session.loggedIn = true;
    res.json({ user, message: "You are now logged in!" });
  });
});

router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

router.post("/reset", async (req, res) => {
  const { email } = req.body;
  console.log("email", email);

  const user = await Participant.findOne({ email });
  console.log("user", user);

  if (!user)
    return res
      .status(401)
      .json({ error: "No user with that email address exists" });

  const tempPW = Math.random().toString(36).slice(-8);

  console.log("tempPW", tempPW);

  const msg = {
    to: email,
    from: "wecare@playmakers.com",
    subject: "Account Recovery",
    html: `<p>Hello ${
      user.first_name || user.username
    },</p><p>Your new temporary password is: ${tempPW}</p><p>Please return to the login screen and use this password to login. You can then change your password under your account settings`,
  };

  try {
    await sgMail.send(msg);
    console.log("email sent");
    user.password = tempPW;
    pusher.trigger("checkin", "logged-in", true);
    await user.save();
    return res.status(200).json({ message: "Email sent" });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error sending email" });
  }
});

export default router;
