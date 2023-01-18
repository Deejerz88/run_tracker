import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import { Participant } from "../schemas/index.js";
import dbConnect from "../dbConnect/dbConnect.js";
import { Duration } from "luxon";
import _ from "lodash";
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

    //use aggregation to calculate totals

    const [raceTotals] = await Participant.aggregate([
      {
        $match: {
          user_id: 907365,
        },
      },
      {
        $unwind: "$races",
      },
      {
        $match: {
          "races.id": 2190,
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
          durationHours: {
            $avg: "$races.attendance.duration.hours",
          },
          durationMinutes: {
            $avg: "$races.attendance.duration.minutes",
          },
          durationSeaconds: {
            $avg: "$races.attendance.duration.seconds",
          },
        },
      },
    ]);

    console.log("raceTotals", raceTotals);

    const {
      paceMinutes,
      paceSeconds,
      durationHours,
      durationMinutes,
      durationSeconds,
    } = raceTotals;

    try {
      raceTotals.duration = Duration.fromObject({
        hours: durationHours,
        minutes: durationMinutes,
        seconds: durationSeconds,
      }).toObject();
    } catch (error) {
      console.log("error", error);
    }

    try {
      raceTotals.pace = Duration.fromObject({
        minutes: paceMinutes,
        seconds: paceSeconds,
      }).toObject();
    } catch (error) {
      console.log("error", error);
    }

    update = { ...update, ...raceTotals };

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

    // console.log("update", update);

    // const updatedRace = races.find((r) => r.id === raceUpdate.id);
    // console.log("updatedRace", updatedRace);
    // //calculate race totals
    // updatedRace.totalAttendance = updatedRace.attendance.length;

    // updatedRace.totalMileage = _.sumBy(updatedRace.attendance, "mileage");

    // const durationMinutes = _.sumBy(updatedRace.attendance, (a) => {
    //   const { hours, minutes, seconds } = a.duration;
    //   return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
    // });

    // updatedRace.avgMileage =
    //   updatedRace.totalMileage / updatedRace.totalAttendance;

    // if (durationMinutes) {
    //   updatedRace.avgPace = Duration.fromObject({
    //     minutes: durationMinutes / updatedRace.totalMileage,
    //   })
    //     .shiftTo("minutes", "seconds")
    //     .toObject();
    //   updatedRace.totalDuration = Duration.fromObject({
    //     minutes: durationMinutes,
    //   })
    //     .shiftTo("hours", "minutes", "seconds")
    //     .toObject();
    //   updatedRace.avgDuration = Duration.fromObject({
    //     minutes: durationMinutes / updatedRace.totalAttendance,
    //   })
    //     .shiftTo("hours", "minutes", "seconds")
    //     .toObject();
    // }
    // console.log("updatedRace", updatedRace);
    update.races = doc.races;

    //calculate participant totals

    // update.totalAttendance = _.sumBy(update.races, "totalAttendance");

    // update.totalMileage = _.sumBy(update.races, "totalMileage") || 0;

    // const updateDurationMinutes = _.sumBy(update.races, (r) => {
    //   if (!r.totalDuration) return 0;
    //   const { hours, minutes, seconds } = r.totalDuration;
    //   return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
    // });

    // if (updateDurationMinutes) {
    //   update.avgPace = Duration.fromObject({
    //     minutes: updateDurationMinutes / update.totalMileage,
    //   })
    //     .shiftTo("minutes", "seconds")
    //     .toObject();
    //   update.totalDuration = Duration.fromObject({
    //     minutes: updateDurationMinutes,
    //   })
    //     .shiftTo("hours", "minutes", "seconds")
    //     .toObject();
    //   update.avgDuration = Duration.fromObject({
    //     minutes: updateDurationMinutes / update.totalAttendance,
    //   })
    //     .shiftTo("hours", "minutes", "seconds")
    //     .toObject();
    // }
    // update.avgMileage = update.totalMileage / update.totalAttendance;

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
