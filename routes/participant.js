import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import { Participant } from "../schemas/index.js";
import "dotenv/config";
import _ from "lodash";

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

router.get("/", async (req, res) => {
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
  const update = req.body;
  const raceUpdate = update.races[0];
  const attendanceUpdate = raceUpdate.attendance[0];
  // console.log("raceUpdate", raceUpdate, "attendanceUpdate", attendanceUpdate);
  const doc = await Participant.findOne({ user_id: update.user_id });
  if (doc) {
    // console.log("doc", doc);
    const { races } = doc;
    let race = _.pickBy(races, (r) => r.id === raceUpdate.id)[0];
    // console.log("race", race);
    if (race) {
      const { attendance } = race;
      let attendanceInd = _.findIndex(
        attendance,
        (a) => a.date === attendanceUpdate.date
      );
      console.log('attendanceInd', attendanceInd)
      if (attendanceInd > -1) {
        attendance[attendanceInd] = attendanceUpdate;
      } else attendance.push(attendanceUpdate);
      doc.save();
    } else {
      race = raceUpdate;
    }

    console.log("race", race, "doc", doc.races[0].attendance[0]);
    console.log("updated doc", doc);
  } else {
    const participant = new Participant(update);
    const updatedDoc = await participant.save();
    res.json(updatedDoc);
  }
});
export default router;
