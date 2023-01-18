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
});

const settingsSchema = new Schema({
  defaultFields: [String],
});

const goalSchema = new Schema({
  type: String,
  race: { id: Number, name: String },
  category: String,
  mileage: Number,
  duration: durationSchema,
  pace: paceSchema,
  date: String,
});

const participantSchema = new Schema({
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
  totalAttendance: { type: Number, default: () => 0 },
  totalMileage: { type: Number, default: () => 0 },
  avgMileage: { type: Number, default: () => 0 },
  avgDuration: {
    type: durationSchema,
    default: () => ({ hours: 0, minutes: 0, seconds: 0 }),
  },
  totalDuration: {
    type: durationSchema,
    default: () => ({ hours: 0, minutes: 0, seconds: 0 }),
  },
  avgPace: { type: paceSchema, default: () => ({ minutes: 0, seconds: 0 }) },
  races: [raceSchema],
  goals: [goalSchema],
});

participantSchema.statics.checkPassword = async function (password, hash) {
  console.log("password", password, "hash", hash);
  return await bcrypt.compare(password, hash);
};

participantSchema.pre("save", function (next) {
  //update password hash
  if (this.password && this.isModified("password"))
    this.password = bcrypt.hashSync(this.password, 10);

  //update username_lower and email_lower for queries
  this.username_lower = this.username?.toLowerCase() || "";
  this.email_lower = this.email?.toLowerCase() || "";
  next();
});

participantSchema.pre("updateOne", function (next) {
  //update password hash
  if (this.password && this.isModified("password"))
    this.password = bcrypt.hashSync(this.password, 10);

  //update username_lower and email_lower for queries
  this.username_lower = this.username?.toLowerCase() || "";
  this.email_lower = this.email?.toLowerCase() || "";
  next();
});

export default mongoose.model("Participant", participantSchema, "Participant");
