import mongoose from "mongoose";

export default async function dbConnect(req, res, next) {
  mongoose.set("strictQuery", false);
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  next();
}
