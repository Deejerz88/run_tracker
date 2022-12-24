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
  id: Number,
  name: { type: String, index: true },
  type: String,
  totalAttendance: {
    type: "Number",
    default: function () {
      return this.attendance.length;
    },
  },
  totalMileage: {
    type: "Number",
    default: function () {
      return _.sumBy(this.attendance, "mileage");
    },
  },
  totalDuration: {
    type: "String",
    default: function () {
      const durationMinutes = _.sumBy(this.attendance, (a) => {
        const [hours, minutes, seconds] = a.duration.split(":");
        return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
      });
      return Duration.fromObject({ minutes: durationMinutes }).toFormat(
        "hh:mm:ss"
      );
    },
  },
  avgPace: {
    type: "String",
    default: function () {
      const totalMileage = _.sumBy(this.attendance, "mileage");
      const durationMinutes = _.sumBy(this.attendance, (a) => {
        const [hours, minutes, seconds] = a.duration.split(":");
        return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
      });
      const avgMinutes = durationMinutes / totalMileage;
      return Duration.fromObject({ minutes: avgMinutes }).toFormat("mm:ss");
    },
  },
  attendance: [attendanceSchema],
});

const participantSchema = new Schema({
  user_id: { type: String, index: true, unique: true },
  first_name: String,
  last_name: String,
  totalAttendance: {
    type: "Number",
    default: function () {
      // console.log("this", this);
      if (!this) return 0;
      return _.sumBy(this.races, "totalAttendance");
    },
  },
  totalMileage: {
    type: "Number",
    // default: function () {
    //   return _.sumBy(this.races, "totalMileage");
    //  }
  },
  totalDuration: String,
  avgPace: String,
  races: [raceSchema],
});

participantSchema.pre("findOneAndUpdate", async function (next) {
  let update = this.getUpdate();
  console.log("update", update);
//   // console.log("doc", doc);

//   const doc = await this.model.findOne(this.getQuery());
//   if (update.races) {
//     let race = update.races[0];
//     let raceIndex = _.findIndex(doc.races, (r) => r.id === race.id);
//     console.log("raceIndex", raceIndex);
//     if (raceIndex > -1) {
//       // const docRace = doc.races[raceIndex];
//       // doc.races[raceIndex] = race;
//       update.races = doc.races;
//     } else {
//       update.races = [...doc.races, ...race];
//       raceIndex = update.races.length - 1;
//     }
//     race = update.races[raceIndex];
//     console.log("race", race, race.attendance.length);
//     // const newDay = updatedRace
//     //   ? !_.some(updatedRace, (r) => {
//     //       return _.some(r.attendance, (a) => a.date === today);
//     //     })
//     //   : true;
//     // race.attendance.push(...updatedRace.attendance);
//     race.totalAttendance = race.attendance.length;
//     race.totalMileage = _.sumBy(race.attendance, "mileage");
//     const durationMinutes = _.sumBy(race.attendance, (a) => {
//       const [hours, minutes, seconds] = a.duration.split(":");
//       return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
//     });
//     race.totalDuration = Duration.fromObject({
//       minutes: durationMinutes,
//     }).toFormat("hh:mm:ss");
//     const [hours, minutes, seconds] = race.totalDuration.split(":");
//     const duration = Duration.fromObject({ hours, minutes, seconds }).as(
//       "minutes"
//     );
//     race.avgPace = Duration.fromObject({
//       minutes: duration / race.totalMileage,
//     }).toFormat("mm:ss");
//   } else {
//     console.log("update", update);
//     const race = update.races[0];
//     const { mileage, duration, pace } = update.races[0].attendance[0];
//     race.totalAttendance = 1;
//     race.totalMileage = mileage;
//     race.totalDuration = duration;
//     race.avgPace = pace;
//     update.races[0] = race;
//     // doc.update({}, { $set: })
//   }
  update.totalAttendance = _.sumBy(update.races, "totalAttendance");
  update.totalMileage = _.sumBy(update.races, "totalMileage");
  const totalMinutes = _.sumBy(update.races, (d) => {
    const [hours, minutes, seconds] = d.totalDuration.split(":");
    return Duration.fromObject({ hours, minutes, seconds }).as("minutes");
  });
  update.totalDuration = Duration.fromObject({
    minutes: totalMinutes,
  }).toFormat("hh:mm:ss");
  this.setUpdate(update);
  next();
});

export default mongoose.model("Participant", participantSchema, "Participant");
