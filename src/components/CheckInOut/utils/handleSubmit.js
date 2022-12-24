import $ from "jquery";
import { startCase, mapKeys } from "lodash";
import { DateTime } from "luxon";
import axios from "axios";

const handleSubmit = async ({ e, checkIn, participant, table, race }) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("race", race);
  const activeKey = $("#checkInOut").attr("name");
  const fields = $(`input[name=${activeKey}]`);
  const { user_id } = participant;
  console.log("participant", participant);
  console.log("fields", fields);
  const data = {
    duration: {},
    pace: {},
    mileage: {},
    finish: {},
    start: { time: checkIn.start },
  };
  fields.each((i, field) => {
    const { id, value } = field;
    console.log("id", id, "value", value);
    const group = id.split("-")[0];
    const type = id.split("-")[1];
    data[group][type] =
      group === "start" || group === "finish" ? value : Number(value);
  });
  console.log("data", data);
  table.updateData([{ user_id, [`checked${startCase(activeKey)}`]: true }]);
  participant = mapKeys(participant, (value, key) => {
    return key.replace(/_n/g, "N");
  });
  // console.log("participant", participant);
  participant.races = [
    {
      ...race,
      attendance: [
        {
          date: DateTime.local().toISODate(),
          ...data,
          start: data.start.time,
          finish: data.finish.actual || data.finish.target,
          mileage: data.mileage.actual || data.mileage.target,
        },
      ],
    },
  ];
  console.log("participant", participant);
  const res = await axios.post("/participant", participant);

  console.log("res", res);
  if (res.statusText === "OK") {
    console.log(participant.name, "updated", res.data);
  }
};

export default handleSubmit;
 