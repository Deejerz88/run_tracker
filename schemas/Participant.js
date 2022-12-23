import mongoose from "mongoose";
const { Schema } = mongoose;

const participantSchema = new Schema({
  user_id: String,
  fullName: String,
  firstName: String,
  lastName: String,
  totalAttendance: Number,
  totalMileage: Number,
  totalDuration: Number,
  avgPace: Number,
  events: [
    {
      event_id: String,
      name: String,
      totalAttendance: Number,
      totalMileage: Number,
      totalDuration: Number,
      avgPace: Number,
      attendance: [
        {
          date: Date,
          duration: Number,
          mileage: Number,
          pace: Number,
          checkedIn: Boolean,
          checkedOut: Boolean,
        },
      ],
    },
  ],
});

participantSchema.set("toJSON", { virtuals: true });

participantSchema.virtual("totalAttendance").set(function () {
  return this.events.reduce((total, event) => {
    return total + event.totalAttendance;
  }, 0);
});

participantSchema.virtual("fullName").set(function () {
  return `${this.firstName} ${this.lastName}`;
});

participantSchema.virtual("totalMileage").set(function () {
  return this.events.reduce((total, event) => {
    return (
      total +
      event.attendance.reduce((total, attendance) => {
        return total + attendance.mileage;
      }, 0)
    );
  }, 0);
});

participantSchema.virtual("totalDuration").set(function () {
  return this.events.reduce((total, event) => {
    return (
      total +
      event.attendance.reduce((total, attendance) => {
        return total + attendance.duration;
      }, 0)
    );
  }, 0);
});

participantSchema.virtual("avgPace").set(function () {
  return this.totalDuration / this.totalMileage;
});

participantSchema.virtual("events.totalAttendance").set(function () {
  return this.attendance.length;
});

participantSchema.virtual("events.totalMileage").set(function () {
  return this.attendance.reduce((total, attendance) => {
    return total + attendance.mileage;
  }, 0);
});

participantSchema.virtual("events.totalDuration").set(function () {
  return this.attendance.reduce((total, attendance) => {
    return total + attendance.duration;
  }, 0);
});

participantSchema.virtual("events.avgPace").set(function () {
  return this.totalDuration / this.totalMileage;
});

export default mongoose.model("Participant", participantSchema);
