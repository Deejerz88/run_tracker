import express from 'express';
import participantRouter from './participant.js';
import raceRouter from './race.js';
import userRouter from './user.js';
const app = express();

app.use("/participant", participantRouter);
app.use('/race', raceRouter);
app.use('/user', userRouter);

export default app;