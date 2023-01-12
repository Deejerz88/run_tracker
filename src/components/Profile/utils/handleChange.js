import { DateTime, Duration } from "luxon";
import $ from "jquery";

const handleChange = ({
  e,
  state,
  setState,
  setContext,
  races,
  setSelectedRace,
  setSelectedDate,
}) => {
  e.stopPropagation();
  let { id, value } = e.target;
  let [group, type, inOut] = id.split("-");

  if (group === "checkin") {
    if (type === "race") {
      const race = races?.find((r) => r.name === value);
      console.log('race change', race)
      setContext((prevState) => ({
        ...prevState,
        race,
      }));
      setSelectedRace(race);
    } else if (type === "date") {
      setContext((prevState) => ({
        ...prevState,
        date: value,
      }));
      setSelectedDate(value);
    }

    return;
  }

  const startTime = DateTime.fromFormat(
    $(`#start-time-${inOut}`).val(),
    "HH:mm"
  );
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
    //mileage or start/finish
    update[group] =
      group === "mileage"
        ? Number(value)
        : DateTime.fromFormat(value, "HH:mm").toMillis();
  
  if (group !== "start" && group !== "finish") {
    //pace, duration, or mileage
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
    console.log('finish', finish)
    update.duration = finish
      .diff(startTime, ["hours", "minutes", "seconds"])
      .toObject();
    
    console.log('duration', update.duration)
    
    const currPace =
      Duration.fromObject(update.duration).as("seconds") / update.mileage || 1;
      console.log('currPace', currPace)
    
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
