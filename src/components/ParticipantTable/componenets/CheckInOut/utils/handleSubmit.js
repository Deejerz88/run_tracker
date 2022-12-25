import $ from "jquery";
import { startCase } from "lodash";
import { DateTime, Duration } from "luxon";
import axios from "axios";

const handleSubmit = async ({ e, checkIn, participant, table, race }) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("race", race);
  const activeKey = $("#checkInOut").attr("name");
  const fields = $(`input[name=${activeKey}]`);
  const data = {
    duration: {},
    pace: {},
    mileage: {},
    finish: {},
    start: { time: checkIn.start },
  };
  fields.each((i, field) => {
    const { id, value } = field;
    const group = id.split("-")[0];
    const type = id.split("-")[1];
    data[group][type] =
      group === "start" || group === "finish"
        ? DateTime.fromFormat(value, "HH:mm").toMillis()
        : Number(value);
  });
  // table.updateData([{ user_id, [`checked${startCase(activeKey)}`]: true }]);
  // console.log("participant", participant);
  console.log("data", data);
  const { pace, duration, start, finish, mileage } = data;
  participant.races = [
    {
      ...race,
      attendance: [
        {
          date: DateTime.local().toISODate(),
          [`checked${startCase(activeKey)}`]: true,
          pace,
          duration,
          start: start.time,
          finish: finish.actual || finish.target,
          mileage: mileage.actual || mileage.target,
        },
      ],
    },
  ];
  const res = await axios.post("/participant", participant);
  if (res.statusText === "OK") {
    console.log("updated", res.data);
  }
};

export default handleSubmit;
