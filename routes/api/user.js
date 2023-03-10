import axios from "axios";
import express from "express";
import { Participant } from "../../schemas/index.js";
import sgMail from "@sendgrid/mail";
import Pusher from "pusher";
import "dotenv/config";
import dbConnect from "../../utils/dbConnect.js";
import _ from "lodash";

const pusher = new Pusher({
  appId: process.env.REACT_APP_PUSHER_ID,
  key: process.env.REACT_APP_PUSHER_KEY,
  secret: process.env.REACT_APP_PUSHER_SECRET,
  cluster: "us2",
  useTLS: true,
});

sgMail.setApiKey(process.env.SENDGRID_KEY);

const router = express.Router();

router.post("/", dbConnect, async (req, res) => {
  const update = req.body;
  let user;
  try {
    user = await Participant.findOne({
      email_lower: update.email.toLowerCase(),
    });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error finding user" });
  }

  if (!user || !user.user_id)
    return res.status(404).json({ error: "User not found" });

  try {
    await user.updateOne(update);
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error updating user" });
  }

  res.json({ user });
});

router.post("/signup", dbConnect, async (req, res) => {
  let { username, email, password, races } = req.body;
  let user;

  try {
    user = await Participant.findOne({ email_lower: email.toLowerCase() });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error finding user" });
  }

  if (user?.user_id)
    return res.status(409).json({ error: "User already exists" });

  let { data: clubParticipants } = await axios.get(
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

  let participant =
    clubParticipants.club_members.find(
      (participant) => participant.user.email === email
    ) || {};

  if (!participant.user) {
    let promises = [];
    races?.forEach((race) => {
      const { id, type, eventIds } = race;
      if (type === "club") return;
      const promise = new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get(
            `https://runsignup.com/rest/race/${id}/participants`,
            {
              params: {
                api_key: process.env.RSU_KEY,
                api_secret: process.env.RSU_SECRET,
                event_id: eventIds.join(","),
                format: "json",
                results_per_page: 2500,
              },
            }
          );
          resolve(data);
        } catch (err) {
          console.log("err", err);
          reject(err);
        }
      });

      promises.push(promise);
    });

    let allParticipants = await Promise.all(promises);

    const eventParticipants = _.concat(
      allParticipants[0].map((event) => event.participants)
    );

    participant =
      eventParticipants[0].find(
        (p) => p.user?.email_lower === email.toLowerCase()
      ) || {};
  }

  if (!participant.user)
    participant.user = { user_id: Math.floor(Math.random() * 1000000) };

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

  req.session.save(() => {
    req.session.user = newUser;
    req.session.loggedIn = true;
    res.json({ user: newUser, message: "You are now logged in!" });
  });
});

router.post("/login", dbConnect, async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Participant.findOne({
      username_lower: username.toLowerCase(),
    });

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
  } catch (err) {
    console.log("err", err);
    res.status(500).json(err);
  }
});

router.post("/logout", dbConnect, (req, res) => {
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
  let user;
  try {
    user = await Participant.findOne({ email_lower: email.toLowerCase() });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error finding user" });
  }

  if (!user?.user_id)
    return res
      .status(401)
      .json({ error: "No user with that email address exists" });

  const tempPW = Math.random().toString(36).slice(-8);

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

router.get("/update", dbConnect, async (req, res) => {
  const participants = await Participant.find({});
  console.log("participants", participants);

  participants.forEach((participant) => {
    // if (participant.email)
    //   participant.email_lower = participant.email.toLowerCase();

    // if (participant.username)
    //   participant.username_lower = participant.username.toLowerCase();
    // else {
    //   participant.username = participant.email;
    //   participant.username_lower = participant.email.toLowerCase();
    // }

    if (!participant.settings) participant.settings = { defaultFields: [] };
    participant.save();
  });

  res.json("All participants updated");
});

export default router;
