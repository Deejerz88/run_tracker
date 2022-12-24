import mongoose from "mongoose";
import _ from "lodash";
import { Duration } from "luxon";
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
  id: Number,
  name: String,
  type: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: String,
  avgPace: String,
  attendance: [attendanceSchema],
});

const participantSchema = new Schema({
  user_id: Number,
  first_name: String,
  last_name: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: String,
  avgPace: String,
  races: [raceSchema],
});

participantSchema.pre("findOneAndUpdate", function (next) {
  let update = this.getUpdate();
  if (update.races)
    update.races.forEach((race) => {
      console.log("race", race, race.attendance.length);
      race.totalAttendance = race.attendance.length;
      race.totalMileage = _.sumBy(race.attendance, "mileage");
      race.totalDuration = _.sumBy(race.attendance, "duration");
      const [hours, minutes, seconds] = race.totalDuration.split(":");
      const duration = Duration.fromObject({ hours, minutes, seconds }).as(
        "minutes"
      );
      race.avgPace = Duration.fromObject({
        minutes: duration / race.totalMileage,
      }).toFormat("mm:ss");
    });
  else {
    console.log("update", update);
    const race = update.races[0];
    const { mileage, duration, pace } = update.races[0].attendance[0];
    race.totalAttendance = 1;
    race.totalMileage = mileage;
    race.totalDuration = duration;
    race.avgPace = pace;
    update.races[0] = race;
    // doc.update({}, { $set: })
  }
  update.totalAttendance = _.sumBy(update.races, "totalAttendance");
  update.totalMileage = _.sumBy(update.races, "totalMileage");
  const totalMinutes = _.sumBy(update.races, (d) => {
    const [hours, minutes, seconds] = d.totalDuration.split(":");
    return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
  });
  update.totalDuration = Duration.fromObject({
    minutes: totalMinutes,
  }).toFormat("hh:mm:ss");
  next();
});

export default mongoose.model("Participant", participantSchema, "Participant");
