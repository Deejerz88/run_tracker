import express from 'express';
import memberRouter from './member.js';
import raceRouter from './race.js';
const app = express();

app.use('/member', memberRouter);
app.use('/race', raceRouter);

export default app;