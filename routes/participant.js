import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import { Participant } from "../schemas/index.js";
import "dotenv/config";
import _ from "lodash";

const router = express.Router();

router.get("/", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const participants = await Participant.find({}).lean();
  // console.log("participants", participants);
  res.json(participants);
});

router.get("/all", async (req, res) => {
  const participants = await axios.get("https://runsignup.com/rest/users", {
    params: {
      api_key: process.env.RSU_KEY,
      api_secret: process.env.RSU_SECRET,
      format: "json",
      results_per_page: 2500,
    },
  });
  console.log("participants", participants.data);
  res.json(participants.data);
});

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  console.log("user_id", user_id);
  if (!user_id) return res.json({});
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let participant = await Participant.findOne({ user_id })
    .lean()
    .catch((e) => console.log("e", e));
  console.log("participant", participant);
  if (!participant) {
    const { data } = await axios.get("https://runsignup.com/rest/user/", {
      params: {
        api_key: process.env.RSU_KEY,
        api_secret: process.env.RSU_SECRET,
        format: "json",
        user_id,
      },
    });
    console.log("data", data);
    if (!data) return res.json({});
    participant = data.user;
  }
  res.json(participant);
});

// router.get('/rsu/:user_id', async (req, res) => {
//   const { user_id } = req.params;
//   const { data } = await axios.get('https://runsignup.com/rest/user/', {

// router.get("/:user_id/:race_id", async (req, res) => {
//   const { user_id, race_id } = req.params;
//   console.log("user_id", user_id);
//   mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   const participant = await Participant.findOne({
//     user_id,
//   });

//   console.log("participant", participant);
//   res.json(participant);
// });

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
  type === "race"
    ? data.forEach((event) => participants.push(...(event.participants || [])))
    : (participants = data.club_members);
  if (!participants.length) return res.json([]);
  // console.log(participants[0]);
  participants = participants.map((participant) => {
    const { user_id, first_name, last_name, email, phone } = participant.user;
    return {
      user_id,
      first_name,
      last_name,
      email,
      phone,
    };
  });
  res.json(participants);
});

router.post("/", async (req, res) => {
 try { mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const update = req.body;
  const raceUpdate = update.races[0];
  const attendanceUpdate = raceUpdate.attendance[0];
  console.log("raceUpdate", raceUpdate);
  let doc = await Participant.findOne({ user_id: update.user_id });
  console.log("doc", doc);
  if (doc) {
    const { races } = doc;
    console.log("races", races);
    let race = races.find((r) => r.id === raceUpdate.id);
    console.log("race", race);
    if (race) {
      const { attendance } = race;
      let attendanceInd = _.findIndex(
        attendance,
        (a) => a.date === attendanceUpdate.date
      );
      if (attendanceInd > -1) {
        attendance[attendanceInd] = {
          ...attendanceUpdate,
          start: attendanceUpdate.start || attendance[attendanceInd].start,
          finish: attendanceUpdate.finish || attendance[attendanceInd].finish,
          checkedIn:
            attendanceUpdate.checkedIn || attendance[attendanceInd].checkedIn,
          checkedOut:
            attendanceUpdate.checkedOut || attendance[attendanceInd].checkedOut,
        };
      } else attendance.push({ ...attendanceUpdate });
    } else {
      race = raceUpdate;
      races.push(race);
    }
  } else {
    doc = new Participant(update);
  }
  const updatedDoc = await doc.save();
  res.json(updatedDoc);} catch (e) { console.log("e", e); }
});
export default router;
