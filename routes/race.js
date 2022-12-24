import express from "express";
import axios from "axios";
import "dotenv/config";

const router = express.Router();

const key = process.env.RSU_KEY;
const secret = process.env.RSU_SECRET;

router.get("/", async (req, res) => {
  const { data } = await axios.get(
    `https://runsignup.com/rest/races?api_key=${key}&api_secret=${secret}&only_partner_races=T&events=T&format=json`
  );
  console.log("data", data);
  const races = data.races.map((race) => {
    const { race_id: id, name, events } = race.race;
    return {
      id,
      name,
      type: "race",
      eventIds: events.map((event) => event.event_id),
    };
  });
  races.unshift({ id: 1127, name: "Team Playmakers", type: "club" });
  res.json(races);
});

export default router;
