import { DateTime, Duration } from "luxon";
import $ from "jquery";

const getMinutes = (type, value, mileage) => {
  let minutes = 0;
  switch (type) {
    case "hours":
      minutes = (value * 60) / mileage;
      break;
    case "minutes":
      minutes = value / mileage;
      break;
    case "seconds":
      minutes = value / 60 / mileage;
      break;
    default:
      break;
  }
  return minutes;
};

const handleChange = ({ e, checkIn, setCheckIn }) => {
  let { id, value } = e.target;
  let group = id.split("-")[0];
  let type = id.split("-")[1];
  console.log("id", id, "group", group, "type", type);
  console.log("value", value);
  const startTime = DateTime.fromFormat($("#start-time").val(), "HH:mm");
  switch (group) {
    case "mileage":
      (() => {
        const update = { mileage: value };
        let { minutes, seconds } = checkIn.pace;
        const newDuration = Duration.fromObject({
          hours: 0,
          minutes: minutes * value,
          seconds: seconds * value,
        });
        update.duration = newDuration.values;
        console.log("newDuration", newDuration.values);
        update.finish = startTime.plus(newDuration).toFormat("HH:mm");
        setCheckIn({ ...checkIn, ...update });
      })();
      break;
    case "pace":
      checkIn.duration[type] = value * checkIn.mileage;
      (() => {
        let { hours, minutes, seconds } = checkIn.duration;
        if (seconds > 60) {
          minutes += Math.floor(seconds / 60);
          seconds = seconds % 60;
        }
        if (minutes > 60) {
          hours += Math.floor(minutes / 60);
          minutes = minutes % 60;
        }
        if (minutes === 60) {
          hours += 1;
          minutes = 0;
        }
        const newDuration = { hours, minutes, seconds };
        setCheckIn({
          ...checkIn,
          [group]: {
            ...checkIn[group],
            [type]: Number(value),
          },
          duration: newDuration,
          finish: startTime.plus(newDuration).toFormat("HH:mm"),
        });
      })();
      break;
    case "duration":
      checkIn.duration[type] = value;
      (() => {
        let {
          hours: durHours,
          minutes: durMin,
          seconds: durSec,
        } = checkIn.duration;
        let minutes = getMinutes(type, value, checkIn.mileage);
        let seconds = (minutes % 1) * 60;
        minutes = Math.floor(minutes);
        seconds = seconds.toFixed(1);
        setCheckIn({
          ...checkIn,
          [group]: {
            ...checkIn[group],
            [type]: Number(value),
          },
          pace: {
            minutes,
            seconds,
          },
          finish: startTime
            .plus({ hours: durHours, minutes: durMin, seconds: durSec })
            .toFormat("HH:mm"),
        });
      })();
      break;
    case "finish":
      (() => {
        let finish = DateTime.fromFormat(value, "HH:mm");
        console.log("finish", finish, "startTime", startTime);
        const newDuration = finish.diff(startTime, [
          "hours",
          "minutes",
          "seconds",
        ]);
        console.log("newDuration", newDuration);
        let {
          hours: durationHours,
          minutes: durationMinutes,
          seconds: durationSeconds,
        } = newDuration.toObject();
        let paceMinutes = newDuration.as("minutes") / checkIn.mileage;
        let paceSeconds = ((paceMinutes % 1) * 60).toFixed(1);
        paceMinutes = Math.floor(paceMinutes);
        durationHours = Math.floor(durationHours);
        durationMinutes = Math.floor(durationMinutes);
        durationSeconds = durationSeconds?.toFixed(1) || 0;
        setCheckIn({
          ...checkIn,
          [group]: value,
          duration: {
            hours: durationHours,
            minutes: durationMinutes,
            seconds: durationSeconds,
          },
          pace: {
            minutes: paceMinutes,
            seconds: paceSeconds,
          },
        });
      })();
      break;
    case "start":
      (() => {
        console.log("value", value);
        let finish = DateTime.fromFormat(value, "HH:mm").plus(checkIn.duration);
        setCheckIn({
          ...checkIn,
          start: value,
          finish: finish.toFormat("HH:mm"),
        });
      })();
      break;

    default:
      break;
  }
};

export default handleChange;
