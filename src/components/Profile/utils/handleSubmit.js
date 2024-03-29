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
  const activeKey = $("#checkInOut").attr("name"); //in or out

  if (activeKey === "out" && !checkedIn) {
    toast.error("Participant must be checked in before checking out", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
    return;
  }
  // else if (
  //   activeKey === "in" &&
  //   state.duration?.hours >= 1 &&
  //   !state.acknowledged
  // ) {
  //   // return if duration is greater than 1 hour and acknowledgement is not checked
  //   toast.error("Please accept duration acknowledgement", {
  //     position: toast.POSITION.TOP_CENTER,
  //     autoClose: 1500,
  //   });
  //   return;
  // }

  //get checkin or checkout fields
  let fields = $(`input[name=${activeKey}]`);
  //filter out fields that are not being shown
  fields = fields.filter((i, field) => {
    const group = field.id.split("-")[0]; // duration, pace, mileage, start, finish
    return showGroup[group] || group === "start" || group === "finish";
  });
  if (!fields) return;

  const data = {
    duration: {},
    pace: {},
    mileage: null,
    finish: {},
    start: { time: state.start },
  };

  fields.each((i, field) => {
    const { id, value } = field;
    const [group, type] = id.split("-"); //duration-hours, pace-minutes, etc

    if (group !== "mileage")
      data[group][type] = // data[duartion][hours]...
        group === "start" || group === "finish"
          ? DateTime.fromFormat(value, "HH:mm").toMillis()
          : Number(value);
    else data[group] = Number(value); //mileage
  });

  const { pace, duration, start, finish, mileage } = data;

  if (finish.time < start.time) {
    toast.error("End time must be after start time", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
    return;
  }

  const noWait = $("#no-wait").is(":checked");

  participant.races = [
    {
      ...selectedRace,
      attendance: [
        {
          date: selectedDate,
          pace,
          duration,
          start: start.time,
          finish: finish.time,
          mileage,
          // checkedIn: state.checkedIn || true,
          // checkedOut: state.checkedOut || false,
          checkedOut: noWait,
          [`checked${startCase(activeKey)}`]: true,
          doNotWait: state.doNotWait,
        },
      ],
    },
  ];

  participant.settings = { ...participant.settings, defaultFields: defaults };

  try {
    let { data: newParticipant } = await axios.post(
      "/participant/checkin",
      participant
    );

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
  } catch (err) {
    console.log(err);
    toast.error(`Problem checking ${activeKey}, please try again.`, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
  }
};

export default handleSubmit;
