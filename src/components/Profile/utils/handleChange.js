import { DateTime, Duration } from "luxon";
import $ from "jquery";

const handleChange = ({
  e,
  state,
  setState,
  setContext,
  races,
  setSelectedRace,
}) => {
  let { id, value } = e.target;
  if ((id = "checkin-race")) {
    const race = races.find((r) => r.name === value);
    setContext((prevState) => ({
      ...prevState,
      race,
    }));
    setSelectedRace(race);
    return;
  }
  let group = id.split("-")[0];
  let type = id.split("-")[1];
  console.log("id", id, "group", group, "type", type);
  console.log("value", value);
  const startTime = DateTime.fromFormat($("#start-time").val(), "HH:mm");
  const update = {
    ...state,
  };
  delete update.duration._id;
  delete update.pace._id;
  if (group === "pace" || group === "duration") {
    update[group][type] = Number(value);
    const groupDuration = Duration.fromObject(update[group])
      .shiftTo("hours", "minutes", "seconds")
      .toObject();
    update[group] = groupDuration;
  } else
    update[group] =
      group === "mileage"
        ? Number(value)
        : DateTime.fromFormat(value, "HH:mm").toMillis();
  console.log("update", update);
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
    update.finish = startTime.plus(update.duration).toMillis();
  } else if (group === "finish") {
    let finish = DateTime.fromMillis(update.finish);
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
    update.finish = finish.toMillis();
  } else if (group === "start") {
    update.finish = DateTime.fromMillis(update.start)
      .plus(update.duration)
      .toMillis();
  }
  setState(update);
};

export default handleChange;
