import mongoose from "mongoose";
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
  start: String,
  finish: String,
  duration: durationSchema,
  pace: paceSchema,
  checkedIn: Boolean,
  checkedOut: Boolean,
});

const raceSchema = new Schema({
  id: Number,
  name: String,
  type: String,
  attendance: [attendanceSchema],
});

const participantSchema = new Schema({
  user_id: Number,
  firstName: String,
  lastName: String,
  races: [raceSchema],
});

participantSchema.set("toJSON", { virtuals: true });

participantSchema.virtual("totalAttendance").set(function () {
  return this.races.reduce((total, race) => {
    return total + race.totalAttendance;
  }, 0);
});

participantSchema.virtual("fullName").set(function () {
  return `${this.firstName} ${this.lastName}`;
});

participantSchema.virtual("totalMileage").set(function () {
  return this.races.reduce((total, race) => {
    return (
      total +
      race.attendance.reduce((total, attendance) => {
        return total + attendance.mileage;
      }, 0)
    );
  }, 0);
});

participantSchema.virtual("totalDuration").set(function () {
  return this.races.reduce((total, race) => {
    return (
      total +
      race.attendance.reduce((total, attendance) => {
        return total + attendance.duration;
      }, 0)
    );
  }, 0);
});

participantSchema.virtual("avgPace").set(function () {
  return this.totalDuration / this.totalMileage;
});

participantSchema.virtual("races.totalAttendance").set(function () {
  return this.attendance.length;
});

participantSchema.virtual("races.totalMileage").set(function () {
  return this.attendance.reduce((total, attendance) => {
    return total + attendance.mileage;
  }, 0);
});

participantSchema.virtual("races.totalDuration").set(function () {
  return this.attendance.reduce((total, attendance) => {
    return total + attendance.duration;
  }, 0);
});

participantSchema.virtual("races.avgPace").set(function () {
  return this.totalDuration / this.totalMileage;
});

export default mongoose.model("Participant", participantSchema, "Participant");
