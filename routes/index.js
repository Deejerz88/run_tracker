import express from 'express';
import memberRouter from './member.js';
const app = express();

app.use('/member', memberRouter);

export default app;