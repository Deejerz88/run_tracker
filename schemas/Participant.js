import mongoose from "mongoose";
import _ from "lodash";
import { DateTime, Duration } from "luxon";
const { Schema } = mongoose;

const durationSchema = new Schema({
  hours: Number,
  minutes: Number,
  seconds: Number,
});

const paceSchema = new Schema({
  minutes: Number,
  seconds: Number,
});

const attendanceSchema = new Schema({
  date: String,
  mileage: Number,
  start: Number,
  finish: Number,
  duration: durationSchema,
  pace: paceSchema,
  checkedIn: Boolean,
  checkedOut: Boolean,
});

const raceSchema = new Schema({
  id: { type: Number, index: true },
  name: { type: String, index: true },
  type: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: durationSchema,
  avgPace: paceSchema,
  attendance: [attendanceSchema],
});

const participantSchema = new Schema({
  user_id: { type: String, index: true, unique: true },
  first_name: String,
  last_name: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: durationSchema,
  avgPace: paceSchema,
  races: [raceSchema],
});

raceSchema.pre("save", function (next) {
  this.totalAttendance = this.attendance.length;
  this.totalMileage = _.sumBy(this.attendance, "mileage");
  const durationMinutes = _.sumBy(this.attendance, (a) => {
    const { hours, minutes, seconds } = a.duration;
    return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
  });
  console.log("durationMinutes", durationMinutes);
  this.avgPace = Duration.fromObject({
    minutes: durationMinutes / this.totalMileage,
  })
    .shiftTo("minutes", "seconds")
    .toObject();
  console.log("this.avgPace", this.avgPace);
  this.totalDuration = Duration.fromObject({
    minutes: durationMinutes,
  })
    .shiftTo("hours", "minutes", "seconds")
    .toObject();
  console.log("this.totalDuration", this.totalDuration);
  next();
});

participantSchema.pre("save", function (next) {
  this.totalAttendance = _.sumBy(this.races, "totalAttendance");
  this.totalMileage = _.sumBy(this.races, "totalMileage");
  const durationMinutes = _.sumBy(this.races, (r) => {
    const {hours, minutes, seconds} = r.totalDuration
    return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
  });
  this.avgPace = Duration.fromObject({
    minutes: durationMinutes / this.totalMileage,
  })
    .shiftTo("minutes", "seconds")
    .toObject();
  this.totalDuration = Duration.fromObject({
    minutes: durationMinutes,
  })
    .shiftTo("hours", "minutes", "seconds")
    .toObject();

  next();
});

export default mongoose.model("Participant", participantSchema, "Participant");
