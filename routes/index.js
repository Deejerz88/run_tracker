import express from 'express';
import participantRouter from './participant.js';
import raceRouter from './race.js';
const app = express();

app.use("/participant", participantRouter);
app.use('/race', raceRouter);

export default app;