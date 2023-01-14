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

  res.json(participants.data);
});

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.json({});

  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let participant = await Participant.findOne({ user_id })
    .lean()
    .catch((e) => console.log("e", e));

  if (!participant) {
    const { data } = await axios.get("https://runsignup.com/rest/user/", {
      params: {
        api_key: process.env.RSU_KEY,
        api_secret: process.env.RSU_SECRET,
        format: "json",
        user_id,
      },
    });
    if (!data) return res.json({});
    participant = data.user;
  }

  res.json(participant);
});

router.get("/:type/:raceId", async (req, res) => {
  const { type, raceId } = req.params;
  const { eventIds } = req.query;

  let mp = type === "race" ? "participants" : "members";

  const url = `https://runsignup.com/rest/${type}/${raceId}/${mp}?`;
  let { data } = await axios.get(url, {
    params: {
      api_key: process.env.RSU_KEY,
      api_secret: process.env.RSU_SECRET,
      format: "json",
      results_per_page: 2500,
      event_id: eventIds,
    },
  });

  if (raceId === "2190") {
    const { data: triData } = await axios.get(
      "https://runsignup.com/rest/club/1131/members",
      {
        params: {
          api_key: process.env.RSU_KEY,
          api_secret: process.env.RSU_SECRET,
          format: "json",
          results_per_page: 2500,
        },
      }
    );
    data = { ...data, club_members: triData.club_members };
  }

  mp = type === "race" ? mp : "club_members";

  let participants = [];
  type === "race"
    ? data.forEach((event) => participants.push(...(event.participants || [])))
    : (participants = data.club_members);

  if (!participants.length) return res.json([]);

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
  const update = req.body;
  const raceUpdate = update.races[0];
  const attendanceUpdate = raceUpdate.attendance[0];
  console.log("update", update);
  mongoose.set("strictQuery", false);
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let doc = await Participant.findOne({ user_id: update.user_id });
  console.log("attendanceUpdate", attendanceUpdate);
  if (doc) {
    update._id = doc._id;
    const { races } = doc;

    let race = races?.find((r) => r.id === raceUpdate.id);
    console.log("race", race);

    //update race
    if (race) {
      const { attendance } = race;
      const thisAttendance = attendance.find(
        (a) => a.date === attendanceUpdate.date
      );

      //update attendance
      if (thisAttendance) {
        thisAttendance.start = attendanceUpdate.start || thisAttendance.start;
        thisAttendance.finish =
          attendanceUpdate.finish || thisAttendance.finish;
        thisAttendance.checkedIn =
          attendanceUpdate.checkedIn || thisAttendance.checkedIn;
        thisAttendance.checkedOut =
          attendanceUpdate.checkedOut || thisAttendance.checkedOut;
      } else attendance.push(attendanceUpdate);
    } else races.push(raceUpdate);

    update.races = doc.races;
    console.log("update", update);
    await doc.updateOne(update);
    res.json(update);
  } else {
    //create new participant
    doc = new Participant(update);
    const newParticipant = await doc.save();
    res.json(newParticipant);
  }
});
export default router;
