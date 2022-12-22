import express, { urlencoded } from "express";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();

app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use("/", routes);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
