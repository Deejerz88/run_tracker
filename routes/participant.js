import express from "express";
import axios from "axios";
import { Participant } from "../schemas/index.js";
import dbConnect from "../utils/dbConnect.js";
import { Duration } from "luxon";
import { raceTotals, userTotals } from "../utils/index.js";
import "dotenv/config";

const router = express.Router();

router.get("/", dbConnect, async (req, res) => {
  const participants = await Participant.find({}).lean();
  res.json(participants);
});

router.get("/:user_id", dbConnect, async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.json({});

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
    data.club_members = [...data.club_members, ...triData.club_members];
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

router.post("/checkin", dbConnect, async (req, res) => {
  let update = req.body;
  delete update._id;
  const raceUpdate = update.races[0];
  // const attendanceUpdate = raceUpdate.attendance[0];
  let doc = await Participant.findOne({ user_id: update.user_id }).lean();
  console.log("doc", doc);

  if (doc) {
    update = { ...doc, ...update };
    console.log("update", update);

    // const { races } = update;

    // let race = races?.find((r) => r.id === raceUpdate.id);
    // console.log("race", race);

    try {
      await Participant.updateOne({ user_id: update.user_id }, update);
    } catch (e) {
      console.log("e", e);
    }

    let race = update.races.find((r) => r.id === raceUpdate.id);

    //use aggregation to calculate totals

    const {
      totalAttendance,
      totalMileage,
      avgMileage,
      paceMinutes,
      paceSeconds,
      avgDurationHours,
      avgDurationMinutes,
      avgDurationSeconds,
      totalDurationHours,
      totalDurationMinutes,
      totalDurationSeconds,
    } = await raceTotals({ update, raceUpdate });

    race.totalAttendance = totalAttendance;
    race.totalMileage = totalMileage;
    race.avgMileage = avgMileage;

    race.avgDuration = Duration.fromObject({
      hours: avgDurationHours,
      minutes: avgDurationMinutes,
      seconds: avgDurationSeconds,
    })
      .shiftTo("hours", "minutes", "seconds")
      .toObject();

    race.totalDuration = Duration.fromObject({
      hours: totalDurationHours,
      minutes: totalDurationMinutes,
      seconds: totalDurationSeconds,
    })
      .shiftTo("hours", "minutes", "seconds")
      .toObject();

    race.avgPace = Duration.fromObject({
      minutes: paceMinutes,
      seconds: paceSeconds,
    })
      .shiftTo("minutes", "seconds")
      .toObject();

    const totals = await userTotals({ update });

    console.log("totals", totals);

    update.totalAttendance = totals.totalAttendance;
    update.totalMileage = totals.totalMileage;
    update.avgMileage = totals.avgMileage;
    update.avgDuration = Duration.fromObject({
      hours: totals.avgDurationHours,
      minutes: totals.avgDurationMinutes,
      seconds: totals.avgDurationSeconds,
    })
      .shiftTo("hours", "minutes", "seconds")
      .toObject();
    update.totalDuration = Duration.fromObject({
      hours: totals.totalDurationHours,
      minutes: totals.totalDurationMinutes,
      seconds: totals.totalDurationSeconds,
    })
      .shiftTo("hours", "minutes", "seconds")
      .toObject();
    update.avgPace = Duration.fromObject({
      minutes: totals.paceMinutes,
      seconds: totals.paceSeconds,
    })
      .shiftTo("minutes", "seconds")
      .toObject();

    console.log("update", update);
    try {
      await Participant.updateOne({ user_id: update.user_id }, update);
      res.json(update);
    } catch (e) {
      console.log("e", e);
      res.status(500).json("error");
    }
  } else {
    //create new participant
    doc = new Participant(update);
    const newParticipant = await doc.save();
    res.json(newParticipant);
  }
});

router.post("/goal", dbConnect, async (req, res) => {
  const { user_id, goal } = req.body;
  console.log("user_id", user_id, "goal", goal);
  let doc = await Participant.findOne({ user_id });
  if (!doc) return res.status(409).json("no participant found");
  console.log("doc", doc);
  doc.goals.push(goal);
  await doc.save();
  res.json(doc);
});

export default router;
