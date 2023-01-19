import express from "express";
import axios from "axios";
import { Participant } from "../schemas/index.js";
import dbConnect from "../dbConnect/dbConnect.js";
import { Duration } from "luxon";
import "dotenv/config";

const router = express.Router();

router.get("/", dbConnect, async (req, res) => {
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

router.post("/", dbConnect, async (req, res) => {
  let update = req.body;
  const raceUpdate = update.races[0];
  const attendanceUpdate = raceUpdate.attendance[0];
  console.log("update", update);

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
      const thisAttendance = attendance?.find(
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

    try {
      await doc.updateOne(update);
    } catch (e) {
      console.log("e", e);
    }

    //use aggregation to calculate totals

    const [raceTotals] = await Participant.aggregate([
      {
        $match: {
          user_id: update.user_id,
        },
      },
      {
        $unwind: "$races",
      },
      {
        $match: {
          "races.id": raceUpdate.id,
        },
      },
      {
        $project: {
          _id: "$_id",
          totalAttendance: { $size: "$races.attendance" },
          totalMileage: { $sum: "$races.attendance.mileage" },
          avgMileage: { $avg: "$races.attendance.mileage" },
          paceMinutes: {
            $avg: "$races.attendance.pace.minutes",
          },
          paceSeconds: {
            $avg: "$races.attendance.pace.seconds",
          },
          avgDurationHours: {
            $avg: "$races.attendance.duration.hours",
          },
          avgDurationMinutes: {
            $avg: "$races.attendance.duration.minutes",
          },
          avgDurationSeconds: {
            $avg: "$races.attendance.duration.seconds",
          },
          totalDurationHours: {
            $sum: "$races.attendance.duration.hours",
          },
          totalDurationMinutes: {
            $sum: "$races.attendance.duration.minutes",
          },
          totalDurationSeconds: {
            $sum: "$races.attendance.duration.seconds",
          },
        },
      },
    ]);

    console.log("raceTotals", raceTotals);

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
    } = raceTotals;

    race = update.races.find((r) => r.id === raceUpdate.id);

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

    console.log("update", race);

    const [totals] = await Participant.aggregate([
      {
        $match: { user_id: update.user_id },
      },
      {
        $unwind: "$races",
      },
      {
        $unwind: "$races.attendance",
      },
      {
        $group: {
          _id: "$user_id",
          totalAttendance: { $sum: 1 },
          totalMileage: { $sum: "$races.attendance.mileage" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAttendance: 1,
          totalMileage: 1,
          avgMileage: { $divide: ["$totalMileage", "$totalAttendance"] },
        },
      },
    ]);

    console.log("totals", totals);

    update.totalAttendance = totals.totalAttendance;
    update.totalMileage = totals.totalMileage;
    update.avgMileage = totals.avgMileage;

    console.log("update", update);
    try {
      await doc.updateOne(update);
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
  let doc = await Participant.findOne({ user_id });
  if (!doc) return res.status(500).json("error");
  console.log("doc", doc);
  doc.goals.push(goal);
  await doc.save();
  res.json(doc);
});

export default router;
