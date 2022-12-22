import { DateTime, Duration } from "luxon";

export default ({ e, checkIn, setCheckIn }) => {
  let { id, value } = e.target;
  let group = id.split("-")[0];
  let type = id.split("-")[1];
  console.log("id", id, "group", group, "type", type);
  console.log("value", value);
  let newDuration;
  switch (group) {
    case "mileage":
      const update = { mileage: value };
      const { minutes, seconds } = checkIn.pace;
      newDuration = Duration.fromObject({
        hours: 0,
        minutes: minutes * value,
        seconds: seconds * value,
      });
      update.duration = newDuration.values;
      console.log("newDuration", newDuration.values);
      update.finish = DateTime.local().plus(newDuration).toFormat("HH:mm");
      setCheckIn({ ...checkIn, ...update });
      break;
    case "pace":
      if (type === "minutes") {
        let { hours, seconds } = checkIn.duration;
        let minutes = value * checkIn.mileage;
        if (minutes > 60) {
          hours += Math.floor(minutes / 60);
          minutes = minutes % 60;
        } else if (minutes === 60) {
          hours += 1;
          minutes = 0;
        }
        newDuration = { hours, minutes, seconds };
        setCheckIn({
          ...checkIn,
          [group]: {
            ...checkIn[group],
            [type]: Number(value),
          },
          duration: newDuration,
          finish: DateTime.local().plus(newDuration).toFormat("HH:mm"),
        });
      } else if (type === "seconds") {
        let { hours, minutes } = checkIn.duration;
        let seconds = value * checkIn.mileage;
        if (seconds > 60) {
          minutes += Math.floor(seconds / 60);
          seconds = seconds % 60;
        } else if (seconds === 60) {
          minutes += 1;
          seconds = 0;
        }
        if (minutes > 60) {
          hours += Math.floor(minutes / 60);
          minutes = minutes % 60;
        } else if (minutes === 60) {
          hours += 1;
          minutes = 0;
        }
        newDuration = { hours, minutes, seconds };
        setCheckIn({
          ...checkIn,
          [group]: {
            ...checkIn[group],
            [type]: Number(value),
          },
          duration: newDuration,
          finish: DateTime.local().plus(newDuration).toFormat("HH:mm"),
        });
      }
      break;
    case "duration":
      if (type === "hours") {
        let { minutes: durMin, seconds: durSec } = checkIn.duration;
        let minutes = (value * 60) / checkIn.mileage;
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
          finish: DateTime.local()
            .plus({ hours: value, minues: durMin, seconds: durSec })
            .toFormat("HH:mm"),
        });
      } else if (type === "minutes") {
        let { hours: durHours, seconds: durSec } = checkIn.duration;
        let minutes = value / checkIn.mileage;
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
          finish: DateTime.local()
            .plus({ hours: durHours, minutes: value, seconds: durSec })
            .toFormat("HH:mm"),
        });
      } else if (type === "seconds") {
        let { hours: durHours, minutes: durMin } = checkIn.duration;
        let minutes = value / 60 / checkIn.mileage;
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
          finish: DateTime.local()
            .plus({
              hours: durHours,
              minutes: durMin,
              seconds: value,
            })
            .toFormat("HH:mm"),
        });
      }
      break;
    case "finish":
      let finish = DateTime.fromFormat(value, "HH:mm");
      const now = DateTime.local();
      console.log("finish", finish, "now", now);
      newDuration = finish.diff(now, ["hours", "minutes", "seconds"]);
      console.log("newDuration", newDuration);
      let {
        hours: durationHours,
        minutes: durationMinutes,
        seconds: durationSeconds,
      } = newDuration.toObject();
      let paceMinutes = newDuration.as("minutes") / checkIn.mileage;
      let paceSeconds = (paceMinutes % 1) * 60;
      paceMinutes = Math.floor(paceMinutes);
      paceSeconds = paceSeconds.toFixed(1);
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

      break;
    default:
      break;
  }
};
