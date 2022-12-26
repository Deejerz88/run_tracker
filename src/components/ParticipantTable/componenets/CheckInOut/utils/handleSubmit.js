import $ from "jquery";
import { startCase } from "lodash";
import { DateTime } from "luxon";
import axios from "axios";

const handleSubmit = async ({
  e,
  state,
  participant,
  table,
  race,
  handleClose,
}) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("race", race, "state", state.start, e.target.name);
  const activeKey = $("#checkInOut").attr("name");
  const fields = $(`input[name=${activeKey}]`);
  const data = {
    duration: {},
    pace: {},
    mileage: {},
    finish: {},
    start: { time: state.start },
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
  console.log("participant", participant);
  console.log("data", data);
  const { pace, duration, start, finish, mileage } = data;
  participant.races = [
    {
      ...race,
      attendance: [
        {
          date: DateTime.local().toISODate(),
          pace,
          duration,
          start: start.time
          ,
          finish: finish.actual || finish.target,
          mileage: mileage.actual || mileage.target,
          checkedIn: state.checkedIn,
          checkedOut: state.checkedOut,
          [`checked${startCase(activeKey)}`]: true,
        },
      ],
    },
  ];
  delete participant._id;
  console.log("participant", participant);
  axios.post("/participant", participant);
  // console.log("res", res);
  // if (res.statusText === "OK") {
  // console.log("updated", res.data);
  const { user_id } = participant;
  const { checkedIn, checkedOut } = state;
  console.log("update", {
    user_id,
    ...participant,
    checkedIn,
    checkedOut,
    [`checked${startCase(activeKey)}`]: true,
  });
  table.updateData([
    {
      user_id,
      ...participant,
      start: DateTime.fromMillis(start.time
      ).toFormat("HH:mm"),
      return: DateTime.fromMillis(mileage.actual || mileage.target).toFormat(
        "HH:mm"
      ),
      [`checked${startCase(activeKey)}`]: true,
    },
  ]);
  handleClose();
  // } else console.log("error", res);
};

export default handleSubmit;
