import express from "express";
import axios from "axios";
import _ from "lodash";
import "dotenv/config";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log(
    "process.env.RSU_KEY",
    process.env.RSU_KEY,
    "process.env.RSU_SECRET",
    process.env.RSU_SECRET
  );
  const { data } = await axios.get(
    `https://runsignup.com/rest/club/1127/members?api_key=${process.env.RSU_KEY}&api_secret=${process.env.RSU_SECRET}`
  );
  const participants = data.split("</club_member>");
  const members = participants
    .map((member) => {
      if (!member.includes("user_id")) return null;
      const userId = member.match(/<user_id>(.*)<\/user_id>/);
      const firstName = member.match(/<first_name>(.*)<\/first_name>/);
      const lastName = member.match(/<last_name>(.*)<\/last_name>/);
      return {
        id: userId ? userId[1] : null,
        firstName: firstName ? firstName[1] : null,
        lastName: lastName ? lastName[1] : null,
      };
    })
    .filter((member) => member);
  console.log("members", members.length);
  res.json(members);
});

export default router;
