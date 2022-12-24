import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import { Participant } from "../schemas/index.js";
import "dotenv/config";

const router = express.Router();

router.get("/:type/:raceId", async (req, res) => {
  const { type, raceId } = req.params;
  const { eventIds } = req.query;
  let mp = type === "race" ? "participants" : "members";
  console.log("type", type, "raceId", raceId, "mp", mp, "eventIds", eventIds);
  const url = `https://runsignup.com/rest/${type}/${raceId}/${mp}?api_key=${process.env.RSU_KEY}&api_secret=${process.env.RSU_SECRET}&format=json&event_id=${eventIds}&results_per_page=2500`;
  let { data } = await axios.get(url);
  // console.log("data", data);
  // console.log("data", data);
  mp = type === "race" ? mp : "club_members";
  let participants = [];
  if (type === "race") {
    data.forEach((event) => participants.push(...(event.participants || [])));
  } else participants = data.club_members;
  if (!participants.length) return res.json([]);
  participants = participants.map((participant) => {
    const { user_id, first_name, last_name } = participant.user;
    return {
      user_id,
      first_name,
      last_name,
    };
  });
  res.json(participants);
});

router.get('/', async (req, res) => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const participants = await Participant.find({});
  res.json(participants);
});


router.post("/", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const  participant  = req.body;
  const update = await Participant.findOneAndUpdate(
    { user_id: participant.user_id },
    participant,
    {
      upsert: true,
      new: true,
    }
  );
  res.json(update);
});
export default router;
