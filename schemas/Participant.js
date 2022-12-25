import mongoose from "mongoose";
import _ from "lodash";
import { DateTime, Duration } from "luxon";
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  date: String,
  mileage: Number,
  start: Number,
  finish: Number,
  duration: String,
  pace: String,
  checkedIn: Boolean,
  checkedOut: Boolean,
});

const raceSchema = new Schema({
  id: { type: Number, index: true },
  name: { type: String, index: true },
  type: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: String,
  avgPace: String,
  attendance: [attendanceSchema],
});

const participantSchema = new Schema({
  user_id: { type: String, index: true, unique: true },
  first_name: String,
  last_name: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: String,
  avgPace: String,
  races: [raceSchema],
});

raceSchema.pre("save", function (next) {
  this.totalAttendance = this.attendance.length;
  this.totalMileage = _.sumBy(this.attendance, "mileage");
  const durationMinutes = _.sumBy(this.attendance, (a) => {
    const [hours, minutes, seconds] = a.duration.split(":");
    return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
  });
  this.totalDuration = Duration.fromObject({
    minutes: durationMinutes,
  }).toFormat("hh:mm:ss");
  const [hours, minutes, seconds] = this.totalDuration.split(":");
  const duration = Duration.fromObject({ hours, minutes, seconds }).as(
    "minutes"
  );
  this.avgPace = Duration.fromObject({
    minutes: duration / this.totalMileage,
  }).toFormat("mm:ss");
  next();
});

participantSchema.pre("save", function (next) {
  this.totalAttendance = _.sumBy(this.races, "totalAttendance");
  this.totalMileage = _.sumBy(this.races, "totalMileage");
  const durationMinutes = _.sumBy(this.races, (r) => {
    const [hours, minutes, seconds] = r.totalDuration.split(":");
    return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
  }); 
  this.totalDuration = Duration.fromObject({
    minutes: durationMinutes,
  }).toFormat("hh:mm:ss");
  const [hours, minutes, seconds] = this.totalDuration.split(":");
  const duration = Duration.fromObject({ hours, minutes, seconds }).as(
    "minutes"
  );
  this.avgPace = Duration.fromObject({
    minutes: duration / this.totalMileage,
  }).toFormat("mm:ss");
  next();
});

export default mongoose.model("Participant", participantSchema, "Participant");
