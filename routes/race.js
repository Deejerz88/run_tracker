import express from "express";
import axios from "axios";
import "dotenv/config";

const router = express.Router();

router.get("/", async (req, res) => {

  const { data } = await axios.get(`https://runsignup.com/rest/races`, {
    params: {
      api_key: process.env.RSU_KEY,
      api_secret: process.env.RSU_SECRET,
      format: "json",
      events: "T",
      only_partner_races: "T",
    },
  });

  const races = data.races?.map((race) => {
    const { race_id: id, name, events } = race.race;
    return {
      id,
      name,
      type: "race",
      eventIds: events.map((event) => event.event_id),
    };
  });

  races?.unshift({ id: 2190, name: "Team Playmakers", type: "club" });
  res.json(races);
});

export default router;
