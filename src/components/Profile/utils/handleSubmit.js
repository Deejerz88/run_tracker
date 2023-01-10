import $ from "jquery";
import { startCase } from "lodash";
import { DateTime } from "luxon";
import axios from "axios";
import { toast } from "react-toastify";

const handleSubmit = async ({
  e,
  state,
  participant,
  selectedRace,
  selectedDate,
  setContext,
  checkedIn,
  setCheckedIn,
  showGroup,
  defaults,
}) => {
  e.preventDefault();
  e.stopPropagation();
  console.log(
    "race",
    selectedRace,
    "selectedDate",
    selectedDate,
    "defaults",
    defaults
  );
  const activeKey = $("#checkInOut").attr("name");
  if (activeKey === "out" && !checkedIn) {
    console.log("not checked in");
    toast.error("Participant must be checked in before checking out", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
    return;
  } else if (
    activeKey === "in" &&
    state.duration.hours >= 1 &&
    !state.acknowledged
  ) {
    toast.error("Please accept duration acknowledgement", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
    return;
  }
  let fields = $(`input[name=${activeKey}]`);
  console.log("showGroup", showGroup);
  fields = fields.filter((i, field) => {
    const group = field.id.split("-")[0];
    return showGroup[group] || group === "start" || group === "finish";
  });
  console.log("fields", fields);
  if (!fields) return;
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
  const { pace, duration, start, finish, mileage } = data;
  participant.races = [
    {
      ...selectedRace,
      attendance: [
        {
          date: selectedDate,
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
  // participant.settings = { ...participant.settings, defaultFields: defaults };
  console.log("participant", participant);
  let newParticipant = await axios.post("/participant", participant);
  newParticipant = newParticipant.data;
  console.log("newParticipant", newParticipant);
  setContext((prev) => ({
    ...prev,
    user: newParticipant,
  }));
  // handleClose();
  toast.success(
    `${
      newParticipant.first_name
        ? `${newParticipant.first_name} ${newParticipant.last_name}`
        : newParticipant.username
    } checked ${activeKey} for ${selectedRace.name}`,
    {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    }
  );
  setCheckedIn(activeKey === "in");
};

export default handleSubmit;
