import mongoose from "mongoose";
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  user_id: { type: Number, index: true },
  subject: String,
  message: String,
  date: { type: Date, default: () => Date.now() },
  replied: { type: Boolean, default: () => false },
});

const Feedback = mongoose.model("Feedback", feedbackSchema, "Feedback");

export default Feedback;
