import axios from "axios";
import express from "express";
import { Participant } from "../schemas/index.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("email", email, "password", password, "username", username);

  const user = await Participant.findOne({ email });
  console.log("user", user);

  if (user) return res.status(409).json({ error: "User already exists" });

  const { data } = await axios.get("https://runsignup.com/rest/users", {
    params: {
      api_key: process.env.RSU_KEY,
      api_secret: process.env.RSU_SECRET,
      format: "json",
      results_per_page: 2500,
    },
  });
  console.log("participants", data);
  const participant =
    data.users.find((participant) => participant.user.email === email) || {};
  if (!participant.user_id)
    participant.user_id = Math.floor(Math.random() * 1000000);
  console.log("participant", participant);
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
    req.session.user_id = newUser.user_id;
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
    req.session.user_id = user.user_id;
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

export default router;
