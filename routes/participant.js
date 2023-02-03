import express from "express";
import axios from "axios";
import { Participant } from "../schemas/index.js";
import dbConnect from "../utils/dbConnect.js";
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
    const attendanceUpdate = raceUpdate.attendance[0];
    const { races } = doc;
    doc.settings = update.settings;

    // get race object from participant document
    let race = races?.find((r) => r.id === raceUpdate.id);
    if (!race) {
      //add race
      doc.races.push(raceUpdate);
    } else {
      // find attendance by date
      let attendance = race.attendance?.find(
        (a) => a.date === attendanceUpdate.date
      );

      if (!attendance) {
        // add attendance
        race.attendance.push(attendanceUpdate);
      } else {
        // update attendance and update document
        attendance.mileage = attendanceUpdate.mileage;
        attendance.pace = attendanceUpdate.pace;
        attendance.duration = attendanceUpdate.duration;
        attendance.start = attendanceUpdate.start;
        attendance.finish = attendanceUpdate.finish;
        attendance.checkedIn = attendanceUpdate.checkedIn || attendance.checkedIn;
        attendance.checkedOut = attendanceUpdate.checkedOut || attendance.checkedOut;
      }
    }

    try {
      doc = await doc.save();
    } catch (err) {
      console.log("err", err);
      return res.status(500).json({ error: "Error saving participant" });
    }

    //use aggregation to calculate race totals
    doc = await raceTotals(doc, update.user_id, race);

    try {
      doc = await doc.save();
    } catch (err) {
      console.log("err", err);
      return res.status(500).json({ error: "Error saving participant" });
    }

    //use aggregation to calculate user totals
    doc = await userTotals(doc, update.user_id);

    try {
      await doc.save();
    } catch (err) {
      console.log("err", err);
      return res.status(500).json({ error: "Error saving participant" });
    }

    res.json(doc);
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

router.delete(
  "/attendance/:userId/:raceId/:date",
  dbConnect,
  async (req, res) => {
    const { userId, raceId, date } = req.params;
    console.log("userId", userId, "raceId", raceId, "date", date);

    let doc;
    try {
      doc = await Participant.findOne({ user_id: userId });
    } catch (err) {
      console.log("err", err);
      return res.status(500).json({ error: "Error finding participant" });
    }

    if (!doc) return res.status(409).json("No participant found");

    console.log("races", doc.races);

    let race = doc.races.find((r) => r.id === Number(raceId));
    const attendance = race.attendance.find((a) => a.date === date);
    console.log("race", race, "attendance", attendance);

    if (!attendance) return res.status(409).json("no attendance found");

    race.attendance = race.attendance.filter((a) => a.date !== date);

    try {
      doc = await doc.save();
    } catch (err) {
      console.log("err", err);
      res.status(500).json({ error: "Error saving participant" });
    }

    doc = await raceTotals(doc, userId, race);

    try {
      doc = await doc.save();
    } catch (err) {
      console.log("err", err);
      res.status(500).json({ error: "Error saving participant" });
    }

    //use aggregation to calculate user totals
    doc = await userTotals(doc, userId);

    try {
      await doc.save();
    } catch (err) {
      console.log("err", err);
      return res.status(500).json({ error: "Error saving participant" });
    }

    res.json(doc);
  } 
);

export default router;
