import { Participant } from "../schemas/index.js";

export const raceTotals = async ({ update, raceUpdate }) => {
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

  return raceTotals;
};

export const userTotals = async ({ update }) => {
  const [totals] = await Participant.aggregate([
    {
      $match: { user_id: update.user_id },
    },
    {
      $unwind: "$races",
    },
    {
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
  ]);

  return totals;
};
