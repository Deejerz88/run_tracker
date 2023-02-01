import { Participant } from "../schemas/index.js";
import { Duration } from "luxon";

const defaultTotals = [
  {
    totalAttendance: 0,
    totalMileage: 0,
    avgMileage: 0,
    paceMinutes: 0,
    paceSeconds: 0,
    avgDurationHours: 0,
    avgDurationMinutes: 0,
    avgDurationSeconds: 0,
    totalDurationHours: 0,
    totalDurationMinutes: 0,
    totalDurationSeconds: 0,
  },
];

export const raceTotals = async (doc, user_id, race) => {
  console.log("user_id", user_id, "race", race, "raceId", race.id);
  const [raceTotals] = race.attendance.length
    ? await Participant.aggregate([
        {
          // get the updated participant
          $match: { user_id },
        },
        {
          // spread out races array
          $unwind: "$races",
        },
        {
          // get updated race
          $match: {
            "races.id": race.id,
          },
        },
        {
          // calculate race totals and return only the fields we need
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
      ])
    : defaultTotals;

  console.log("raceTotals", raceTotals);

  // update race with new totals
  race.totalAttendance = raceTotals.totalAttendance;
  race.totalMileage = raceTotals.totalMileage;
  race.avgMileage = raceTotals.avgMileage;

  race.avgDuration = Duration.fromObject({
    hours: raceTotals.avgDurationHours,
    minutes: raceTotals.avgDurationMinutes,
    seconds: raceTotals.avgDurationSeconds,
  })
    .shiftTo("hours", "minutes", "seconds")
    .toObject();

  race.totalDuration = Duration.fromObject({
    hours: raceTotals.totalDurationHours,
    minutes: raceTotals.totalDurationMinutes,
    seconds: raceTotals.totalDurationSeconds,
  })
    .shiftTo("hours", "minutes", "seconds")
    .toObject();

  race.avgPace = Duration.fromObject({
    minutes: raceTotals.paceMinutes,
    seconds: raceTotals.paceSeconds,
  })
    .shiftTo("minutes", "seconds")
    .toObject();

  return doc;
};

export const userTotals = async (doc, user_id) => {
  console.log("doc", doc, user_id);
  console.log(doc.races.find((r) => r.id === 2190));
  const [totals] = doc.races.length
    ? await Participant.aggregate([
        {
          // get the updated participant
          $match: { user_id },
        },
        {
          // spread out races array
          $unwind: "$races",
        },
        {
          // calculate totals & create object for each race
          $project: {
            _id: "$_id",
            totalAttendance: { $sum: "$races.totalAttendance" },
            totalMileage: { $sum: "$races.totalMileage" },
            avgMileage: { $avg: "$races.avgMileage" },
            paceMinutes: {
              $avg: "$races.avgPace.minutes",
            },
            paceSeconds: {
              $avg: "$races.avgPace.seconds",
            },
            avgDurationHours: {
              $avg: "$races.avgDuration.hours",
            },
            avgDurationMinutes: {
              $avg: "$races.avgDuration.minutes",
            },
            avgDurationSeconds: {
              $avg: "$races.avgDuration.seconds",
            },
            totalDurationHours: {
              $sum: "$races.totalDuration.hours",
            },
            totalDurationMinutes: {
              $sum: "$races.totalDuration.minutes",
            },
            totalDurationSeconds: {
              $sum: "$races.totalDuration.seconds",
            },
          },
        },
        {
          // combine totals into one object and return it
          $group: {
            _id: "$_id",
            totalAttendance: { $sum: "$totalAttendance" },
            totalMileage: { $sum: "$totalMileage" },
            avgMileage: { $avg: "$avgMileage" },
            paceMinutes: {
              $avg: "$paceMinutes",
            },
            paceSeconds: {
              $avg: "$paceSeconds",
            },
            avgDurationHours: {
              $avg: "$avgDurationHours",
            },
            avgDurationMinutes: {
              $avg: "$avgDurationMinutes",
            },
            avgDurationSeconds: {
              $avg: "$avgDurationSeconds",
            },
            totalDurationHours: {
              $sum: "$totalDurationHours",
            },
            totalDurationMinutes: {
              $sum: "$totalDurationMinutes",
            },
            totalDurationSeconds: {
              $sum: "$totalDurationSeconds",
            },
          },
        },
      ])
    : defaultTotals;

  console.log("totals", totals);

  let {
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
  } = totals;

  doc.totalAttendance = totalAttendance;
  doc.totalMileage = totalMileage;
  doc.avgMileage = avgMileage;
  doc.avgDuration = Duration.fromObject({
    hours: avgDurationHours,
    minutes: avgDurationMinutes,
    seconds: avgDurationSeconds,
  })
    .shiftTo("hours", "minutes", "seconds")
    .toObject();
  doc.totalDuration = Duration.fromObject({
    hours: totalDurationHours,
    minutes: totalDurationMinutes,
    seconds: totalDurationSeconds,
  })
    .shiftTo("hours", "minutes", "seconds")
    .toObject();
  doc.avgPace = Duration.fromObject({
    minutes: paceMinutes,
    seconds: paceSeconds,
  })
    .shiftTo("minutes", "seconds")
    .toObject();

  return doc;
};
