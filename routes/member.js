import express from "express";
import axios from "axios";
import _ from "lodash";
import "dotenv/config";

const router = express.Router();

router.get("/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const { eventIds } = req.query;
  let mp = type === "race" ? "participants" : "members";
  console.log("type", type, "id", id, "mp", mp, "eventIds", eventIds);
  const url = `https://runsignup.com/rest/${type}/${id}/${mp}?api_key=${process.env.RSU_KEY}&api_secret=${process.env.RSU_SECRET}&format=json&event_id=${eventIds}&results_per_page=2500`;
  console.log("url", url);
  let { data } = await axios.get(url);
  // console.log("data", data);
  // console.log("data", data);
  mp = type == "race" ? mp : "club_members";
  let members = [];
  if (type === "race") {
    data.forEach((event) => members.push(...(event.participants || [])));
  } else members = data.club_members;
  if (!members.length) return res.json([]);
  members = members
    .map((member) => {
      const { user_id, first_name, last_name } = member.user;
      return {
        user_id,
        first_name,
        last_name,
      };
    })
    .filter((member) => member.user_id);
  console.log("members", members);
  res.json(members);
});

export default router;
