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
  const activeKey = $("#checkInOut").attr("name");
  console.log("selectedRace", selectedRace);

  if (activeKey === "out" && !checkedIn) {
    toast.error("Participant must be checked in before checking out", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
    return;
  } else if (
    activeKey === "in" &&
    state.duration?.hours >= 1 &&
    !state.acknowledged
  ) {
    toast.error("Please accept duration acknowledgement", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 1500,
    });
    return;
  }

  let fields = $(`input[name=${activeKey}]`);
  //filter out fields that are not being shown
  fields = fields.filter((i, field) => {
    const group = field.id.split("-")[0];
    return showGroup[group] || group === "start" || group === "finish";
  });
  if (!fields) return;

  console.log("fields", fields);

  const data = {
    duration: {},
    pace: {},
    mileage: {},
    finish: {},
    start: { time: state.start },
  };

  fields.each((i, field) => {
    const { id, value } = field;
    const [group, type] = id.split("-");

    data[group][type] =
      group === "start" || group === "finish"
        ? DateTime.fromFormat(value, "HH:mm").toMillis()
        : Number(value);
  });

  const { pace, duration, start, finish, mileage } = data;
  console.log("data", data);

  console.log("participant races", participant.races);

  // let thisRace = participant.races.length;
  //   ? participant.races.find((r) => r.id === selectedRace.id)
  //   : null;

  // let thisAttendance = thisRace
  //   ? thisRace.attendance.find((a) => a.date === selectedDate)
  //   : null;

  // if (!thisRace) {
  //   participant.races.push({
  //     ...selectedRace,
  //     attendance: [
  //       {
  //         date: selectedDate,
  //         pace,
  //         duration,
  //         start: start.time,
  //         finish: finish.actual || finish.target,
  //         mileage: mileage.actual || mileage.target,
  //         checkedIn: state.checkedIn,
  //         checkedOut: state.checkedOut,
  //         [`checked${startCase(activeKey)}`]: true,
  //       },
  //     ],
  //   });
  // } else {
  //   participant.races = []

  // }

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
          mileage: mileage.actual || mileage.target,
          checkedIn: state.checkedIn,
          checkedOut: state.checkedOut,
          [`checked${startCase(activeKey)}`]: true,
        },
      ],
    },
  ];

  console.log("participant races", participant.races);

  participant.settings = { ...participant.settings, defaultFields: defaults };

  try {
    let { data: newParticipant } = await axios.post(
      "/participant",
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
