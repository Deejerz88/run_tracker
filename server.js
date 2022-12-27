import express, { urlencoded } from "express";
import routes from "./routes/index.js";
import path from "path";
import cors from "cors";

const port = process.env.PORT || 5000;
const directory =
  process.env.NODE_ENV === "production" ? "./build" : "./public";

const app = express();

app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static("build"));
app.use(express.static("public"));

app.use("/", routes);

app.use("*", (req, res) => {
  res.sendFile(path.resolve(directory, "index.html"));
});

app.listen(port, () => {
  console.log("Server started on port 5000");
});
