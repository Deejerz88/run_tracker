import express, { urlencoded } from "express";
import routes from "./routes/index.js";
import path from "path";
import cors from "cors";
import compression from "compression";
import session from "express-session";
import MongoStore from "connect-mongo";
import "dotenv/config";


const MONGO_URI = process.env.MONGO_URI;
console.log("MONGODB_URI", MONGO_URI)

const port = process.env.PORT || 5000;
const directory =
  process.env.NODE_ENV === "production" ? "./build" : "./public";

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    },
    crypto: {
      secret: process.env.SESSION_SECRET,
    },
  })
);
app.use(compression());
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
  