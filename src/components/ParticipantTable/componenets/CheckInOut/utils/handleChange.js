import { DateTime, Duration } from "luxon";
import $ from "jquery";

const handleChange = ({ e, checkIn, setCheckIn }) => {
  let { id, value } = e.target;
  let group = id.split("-")[0];
  let type = id.split("-")[1];
  console.log("id", id, "group", group, "type", type);
  console.log("value", value);
  const startTime = DateTime.fromFormat($("#start-time").val(), "HH:mm");
  const update = {
    ...checkIn,
  };
  if (group === "pace" || group === "duration")
    update[group][type] = Number(value);
  else update[group] = group === "mileage" ? Number(value) : value;
  console.log("update", update);
  // checkIn[group][type] = value;
  if (group !== "start" && group !== "finish") {
    group === "duration"
      ? (update.pace = Duration.fromObject({
          seconds:
            Duration.fromObject(update.duration).as("seconds") / update.mileage,
        })
          .shiftTo("minutes", "seconds")
          .toObject())
      : (update.duration = Duration.fromObject({
          seconds:
            Duration.fromObject(update.pace).as("seconds") * update.mileage,
        })
          .shiftTo("hours", "minutes", "seconds")
          .toObject());
    update.finish = startTime.plus(update.duration).toFormat("HH:mm");
  } else if (group === "finish") {
    let finish = DateTime.fromFormat(update.finish, "HH:mm");
    update.duration = finish
      .diff(startTime, ["hours", "minutes", "seconds"])
      .toObject();
    const currPace =
      Duration.fromObject(update.duration).as("seconds") / update.mileage;
    update.pace = Duration.fromObject({
      seconds: currPace,
    })
      .shiftTo("minutes", "seconds")
      .toObject();
    update.finish = finish.toFormat("HH:mm");
  } else if (group === "start") {
    update.finish = DateTime.fromFormat(update.start, "HH:mm")
      .plus(update.duration)
      .toFormat("HH:mm");
  }
  setCheckIn(update);
};

export default handleChange;
