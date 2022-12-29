import $ from "jquery";
import { startCase } from "lodash";
import { DateTime } from "luxon";
import axios from "axios";
import { toast } from "react-toastify";

const handleSubmit = async ({
  e,
  state,
  participant,
  table,
  race,
  handleClose,
  date,
}) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("race", race, "state", state.start, e.target.name);
  const activeKey = $("#checkInOut").attr("name");
  if (activeKey === "out" && !participant.checkedIn) {
    console.log("not checked in");
    toast.error("Participant must be checked in before checking out", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
    return;
  }
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
          date,
          pace,
          duration,
          start: start.time,
          finish: finish.actual || finish.target,
          mileage: mileage.actual || mileage.target,
          checkedIn: state.checkedIn,
          checkedOut: state.checkedOut,
          [`checked${startCase(activeKey)}`]: true,
        },
      ],
    },
  ];
  console.log("participant", participant);
  let newParticipant = await axios.post("/participant", participant);
  newParticipant = newParticipant.data;
  console.log("newParticipant", newParticipant);
  // console.log("res", res);
  // if (res.statusText === "OK") {
  // console.log("updated", res.data);
  const { user_id } = newParticipant;
  const { checkedIn, checkedOut } = state;
  console.log("update", {
    user_id,
    ...newParticipant,
    checkedIn,
    checkedOut,
    [`checked${startCase(activeKey)}`]: true,
  });
  console.log("start", start.time, state.start, newParticipant.start);
  table.updateData([
    {
      user_id,
      ...newParticipant,
      start: DateTime.fromMillis(
        start.time || state.start || participant.start
      ).toFormat("HH:mm"),
      finish: DateTime.fromMillis(finish.actual || finish.target).toFormat(
        "HH:mm"
      ),
      [`checked${startCase(activeKey)}`]: true,
    },
  ]);
  // table.redraw(true);
  handleClose();
  window.scrollTo(0, 0);
  toast.success(`${participant.name} checked ${activeKey}`, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 1500,
  });
};

export default handleSubmit;
