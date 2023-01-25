import mongoose from "mongoose";
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
  defaultFields: { type: [String], default: () => [] },
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
  email: { type: String },
  settings: { type: settingsSchema, default: () => ({}) },
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

const participantPreSave = async function (doc) {
  return new Promise((resolve, reject) => {
    try {
      //hash password if it is modified
      if (doc.password && doc.isModified("password"))
        doc.password = bcrypt.hashSync(doc.password, 10);

      //update username_lower and email_lower for queries
      doc.username_lower = doc.username?.toLowerCase() || "";
      doc.email_lower = doc.email?.toLowerCase() || "";
      resolve();
    } catch (err) {
      console.log("err", err);
      reject(err);
    }
  });
};

participantSchema.pre("save", async function (next) {
  await participantPreSave(this);
});

participantSchema.pre("updateOne", async function (next) {
  const update = this.getUpdate();
  await participantPreSave(update);
});

export default mongoose.model("Participant", participantSchema, "Participant");
