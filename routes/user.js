import express from "express";
import { Participant } from "../schemas/index.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("email", email, "password", password, "username", username);

  const user = await Participant.findOne({ email });
  console.log("user", user);

  if (user) return res.status(409).json({ error: "User already exists" });

  

  let newUser;
  try {
    newUser = await Participant.create({ username, email, password });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Internal server error" });
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
