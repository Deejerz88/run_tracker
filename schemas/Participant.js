import mongoose from "mongoose";
import _ from "lodash";
import { Duration } from "luxon";
import bcrypt from "bcrypt";
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
  checkedIn: { type: Boolean, default: () => false },
  checkedOut: { type: Boolean, default: () => false },
});

const raceSchema = new Schema({
  id: { type: Number, index: true },
  name: { type: String, index: true },
  type: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: durationSchema,
  avgPace: paceSchema,
  avgMileage: Number,
  avgDuration: durationSchema,
  attendance: [attendanceSchema],
  goals: {
    mileage: Number,
    duration: durationSchema,
    pace: paceSchema,
  },
});

const settingsSchema = new Schema({
  defaultFields: [String],
});

const participantSchema = new Schema(
  {
    user_id: { type: Number, index: true, unique: true },
    username: { type: String },
    username_lower: { type: String, index: true },
    email: { type: String, unique: true },
    settings: settingsSchema,
    email_lower: { type: String, index: true },
    phone: String,
    password: String,
    first_name: String,
    last_name: String,
    totalAttendance: Number,
    totalMileage: Number,
    avgMileage: Number,
    avgDuration: durationSchema,
    totalDuration: durationSchema,
    avgPace: paceSchema,
    races: [raceSchema],
    goals: {
      mileage: Number,
      duration: durationSchema,
      pace: paceSchema,
    },
  },
  {
    statics: {
      async checkPassword(password, hash) {
        return await bcrypt.compare(password, hash);
      },
    },
  }
);

raceSchema.pre("save", function (next) {
  //calculate totals
  this.totalAttendance = this.attendance.length;

  this.totalMileage = _.sumBy(this.attendance, "mileage");

  const durationMinutes = _.sumBy(this.attendance, (a) => {
    const { hours, minutes, seconds } = a.duration;
    return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
  });

  this.avgMileage = this.totalMileage / this.totalAttendance;

  if (durationMinutes) {
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
    this.avgDuration = Duration.fromObject({
      minutes: durationMinutes / this.totalAttendance,
    })
      .shiftTo("hours", "minutes", "seconds")
      .toObject();
  }

  next();
});

participantSchema.pre("save", function (next) {

  //update password hash
  if (this.isModified("password"))
    this.password = bcrypt.hashSync(this.password, 10);
  
  //update username_lower and email_lower for queries
  this.username_lower = this.username?.toLowerCase() || "";
  this.email_lower = this.email?.toLowerCase() || "";

  //calculate totals
  this.avgMileage = this.totalMileage / this.totalAttendance;

  if (this.races && this.races.length) {
    this.totalAttendance = _.sumBy(this.races, "totalAttendance");

    this.totalMileage = _.sumBy(this.races, "totalMileage");

    const durationMinutes = _.sumBy(this.races, (r) => {
      if (!r.totalDuration) return 0;
      const { hours, minutes, seconds } = r.totalDuration;
      return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
    });

    if (durationMinutes) {
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
      this.avgDuration = Duration.fromObject({
        minutes: durationMinutes / this.totalAttendance,
      })
        .shiftTo("hours", "minutes", "seconds")
        .toObject();
    }
  }

  next();
});

export default mongoose.model("Participant", participantSchema, "Participant");
