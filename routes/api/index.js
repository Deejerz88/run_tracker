import express from "express";
import userRouter from "./user.js";

const app = express();

app.use("/user", userRouter);

export default app;