import express from "express";
import axios from "axios";
import { Participant } from "../schemas/index.js";
import dbConnect from "../utils/dbConnect.js";
import { Duration } from "luxon";
import { raceTotals, userTotals } from "../utils/index.js";
import "dotenv/config";

const router = express.Router();

router.get("/", dbConnect, async (req, res) => {
  let participants;
  try {
    participants = await Participant.find({}).lean();
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error finding participants" });
  }

  res.json(participants);
});

router.get("/:user_id", dbConnect, async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.json({});

  let participant;
  try {
    participant = await Participant.findOne({ user_id }).lean();
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error finding participant" });
  }

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
      club_member_num: participant.club_member_num,
    };
  });

  console.log("participants", participants[0]);
  res.json(participants);
});

router.post("/checkin", dbConnect, async (req, res) => {
  let update = req.body;
  delete update._id;
  const raceUpdate = update.races[0];
  let doc;
  try {
    doc = await Participant.findOne({ user_id: update.user_id });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error finding participant" });
  }

  if (doc) {
    // update = { ...doc, ...update };
    // update = _.merge(doc, update);
    doc.settings = update.settings;
    const attendanceUpdate = raceUpdate.attendance[0];
    console.log("attendance update", attendanceUpdate);

    const { races } = doc;

    let race = races?.find((r) => r.id === raceUpdate.id);
    console.log("race", race);
    try {
      if (!race) {
        doc.races.push(raceUpdate);

        try {
          doc = await doc.save();
        } catch (err) {
          console.log("err", err);
          return res.status(500).json({ error: "Error saving participant" });
        }

        race = doc.races.find((r) => r.id === raceUpdate.id);
      } else {
        let attendance = race.attendance?.find(
          (a) => a.date === attendanceUpdate.date
        );

        if (!attendance) {
          race.attendance.push(attendanceUpdate);
          try {
            doc = await doc.save();
          } catch (err) {
            console.log("err", err);
            return res.status(500).json({ error: "Error saving participant" });
          }

          race = doc.races.find((r) => r.id === raceUpdate.id);
        } else {
          const {
            mileage,
            pace,
            duration,
            start,
            finish,
            checkedIn,
            checkedOut,
          } = attendanceUpdate;
          attendance.mileage = mileage;
          attendance.pace = pace;
          attendance.duration = duration;
          attendance.start = start;
          attendance.finish = finish;
          attendance.checkedIn = checkedIn;
          attendance.checkedOut = checkedOut;

          console.log("attendance", attendance);
          try {
            doc = await doc.save();
          } catch (err) {
            console.log("err", err);
            return res.status(500).json({ error: "Error saving participant" });
          }

          race = doc.races.find((r) => r.id === raceUpdate.id);
        }
      }

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

      try {
        doc = await doc.save();
      } catch (err) {
        console.log("err", err);
        return res.status(500).json({ error: "Error saving participant" });
      }

      const totals = await userTotals({ update });

      console.log("totals", totals);

      doc.totalAttendance = totals.totalAttendance;
      doc.totalMileage = totals.totalMileage;
      doc.avgMileage = totals.avgMileage;
      doc.avgDuration = Duration.fromObject({
        hours: totals.avgDurationHours,
        minutes: totals.avgDurationMinutes,
        seconds: totals.avgDurationSeconds,
      })
        .shiftTo("hours", "minutes", "seconds")
        .toObject();
      doc.totalDuration = Duration.fromObject({
        hours: totals.totalDurationHours,
        minutes: totals.totalDurationMinutes,
        seconds: totals.totalDurationSeconds,
      })
        .shiftTo("hours", "minutes", "seconds")
        .toObject();
      doc.avgPace = Duration.fromObject({
        minutes: totals.paceMinutes,
        seconds: totals.paceSeconds,
      })
        .shiftTo("minutes", "seconds")
        .toObject();

      // console.log("update", update);
      try {
        await doc.save();
      } catch (err) {
        console.log("err", err);
        return res.status(500).json({ error: "Error saving participant" });
      }
      res.json(doc);
    } catch (e) {
      console.log("checkin save err", e);
      res.status(500).json("error checking in");
    }
  } else {
    //create new participant
    doc = new Participant(update);
    let newParticipant;
    try {
      newParticipant = await doc.save();
    } catch (err) {
      console.log("err", err);
      return res.status(500).json({ error: "Error saving participant" });
    }
    res.json(newParticipant);
  }
});

router.post("/goal", dbConnect, async (req, res) => {
  const { user_id, goal } = req.body;

  let doc;
  try {
    doc = await Participant.findOne({ user_id });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: "Error finding participant" });
  }

  if (!doc) return res.status(409).json("no participant found");
  doc.goals.push(goal);

  try {
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: "Error saving participant" });
  }
});

export default router;
