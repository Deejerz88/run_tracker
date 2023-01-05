import express from "express";
import apiRouter from "./api/index.js";
import participantRouter from "./participant.js";
import raceRouter from "./race.js";
const app = express();

app.use("/api", apiRouter);
app.use("/participant", participantRouter);
app.use("/race", raceRouter);

export default app;
