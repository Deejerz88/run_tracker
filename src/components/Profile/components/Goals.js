import { useEffect, useState, useCallback, useContext } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  FloatingLabel,
  ButtonGroup,
} from "react-bootstrap";
import axios from "axios";
import { BsPlusLg } from "react-icons/bs/index.esm.js";
import $ from "jquery";
import { startCase } from "lodash";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { AppContext } from "../../../App.js";
import { DateTime, Duration as DurationLux } from "luxon";
import { renderToString } from "react-dom/server";
import { toast } from "react-toastify";

const Goals = () => {
  const [state, setState] = useState({
    type: "none",
    race: "",
    category: "",
    mileage: 0,
    pace: {
      minutes: 0,
      seconds: 0,
    },
    duration: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    date: null,
  });
  const [races, setRaces] = useState([]);
  const [Context] = useContext(AppContext);
  const [participant] = useState(Context.participant);
  console.log("participant", participant);
  const resetState = (type) => {
    setState({
      type: type || "",
      race: "",
      category: "",
      mileage: 0,
      pace: {
        minutes: 0,
        seconds: 0,
      },
      duration: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      date: null,
    });
  };

  const hideRow = useCallback((rows) => {
    rows = typeof rows === "number" ? [rows] : rows;
    rows.forEach(async (row) => {
      $(`#goal-row-${row}`).css({ marginLeft: 2000, opacity: 0 });
      setTimeout(() => {
        $(`#goal-row-${row}`).hide();
      }, 500);
    });
  }, []);

  const showRow = useCallback((rows) => {
    rows = typeof rows === "number" ? [rows] : rows;
    rows.forEach(async (row) => {
      $(`#goal-row-${row}`).css({ display: "flex" });
      setTimeout(() => {
        $(`#goal-row-${row}`).css({ marginLeft: 0, opacity: 1 });
      }, 0);
    });
    if (rows[0] !== 1) growForm(85 * rows.length);
  }, []);

  const growForm = (size) => {
    $("#goal-form").height($("#goal-form").height() + size);
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    switch (name) {
      case "type":
        if (state.type === "none" || !state.type) {
          showRow(2);
          // growForm(75);
        }
        resetState(value);
        hideRow([3, 4, 5]);
        $("#goal-form").height(185);
        break;
      case "race":
      case "category":
        setState((prevState) => ({
          ...prevState,
          [name]: value,
        }));
        // if (!state.race ) {
        //   //overall
        //   showRow([3]);
        // } else if (name === "category") {
        //   value === "Finish" ? hideRow([4, 5]) : showRow([4, 5]);
        // }
        break;
      case "date":
        setState((prevState) => ({
          ...prevState,
          [name]: value,
        }));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (state.race) showRow(3);
  }, [state.race, showRow]);

  useEffect(() => {
    if (!state.category) return;

    if (!state.race) showRow([3]);
    else state.category === "Finish" ? hideRow([4]) : showRow([4]);
  }, [state.category, state.race, hideRow, showRow]);

  const handleBlur = (e) => {
    e.preventDefault();
    console.log("state", state);
    const { id, value } = e.target;
    const [group, field] = id.split("-");
    group === "mileage"
      ? setState((prevState) => ({
          ...prevState,
          [group]: Number(value),
        }))
      : setState((prevState) => ({
          ...prevState,
          [group]: {
            ...prevState[group],
            [field]: Number(value),
          },
        }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { type, id } = e.target;
    if (type === "number") {
      e.target.select();
    } else if (id === "add-goal") {
      if (!state.category) {
        //new goal
        resetState();
        showRow(1);
        $("#reset-goal").css({ display: "block" });
        setTimeout(() => {
          $("#reset-goal").css({ opacity: 1 });
        }, 0);
      } else {
        //submit goal
        let { type, race, category, date } = state;
        race = races.find((r) => r.name === race);
        category =
          category.split(" ")[1]?.toLowerCase() || category.toLowerCase();
        console.log("category", category, state, "race", race);
        const target =
          category === "Average Pace" ? "pace" : category.toLowerCase();
        const data = {
          user_id: participant.user_id,
          goal: {
            type,
            race,
            category,
            [target]: state[category.toLowerCase()],
            date,
          },
        };
        console.log("data", data);
        const { data: goal } = await axios.post("/participant/goal", data);
        console.log("goal", goal);
        const table = Tabulator.findTable("#goal-table")[0];
        table.addRow(data.goal);
        resetState();
        hideRow([2, 3, 4, 5]);
        $("#goal-form").height(100);
        $("#reset-goal").css({ opacity: 0 });
        setTimeout(() => {
          $("#reset-goal").css({ display: "none" });
        }, 300);
        toast.success("Goal added!", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } else if (id === "add-goal-date") {
      console.log(e.target);
      setState((prevState) => ({
        ...prevState,
        date: DateTime.local().toISODate(),
      }));
    } else if (id === "reset-goal") {
      $('[id^="goal-row-"]').each((i, row) => {
        $(row).css({ marginLeft: 2000, opacity: 0 });
        setTimeout(() => {
          $(row).hide();
          $("#goal-form").height(100);
        }, 300);
      });
      resetState("none");
    }
  };

  useEffect(() => {
    (async () => {
      const { data: races } = await axios.get("/race");
      setRaces(races);
    })();
  }, []);

  const Race = () => {
    const raceList = ["", ...races];
    return (
      <>
        <FloatingLabel label="Race / Team">
          <Form.Select
            id="goal-race"
            name="race"
            value={state.race}
            onChange={handleChange}
          >
            {raceList.map((race, i) => (
              <option key={i}>{race.name}</option>
            ))}
          </Form.Select>
        </FloatingLabel>
      </>
    );
  };

  const Category = () => {
    return (
      <>
        <FloatingLabel label="Category">
          <Form.Select
            id="goal-category"
            name="category"
            value={state.category}
            onChange={handleChange}
          >
            {["", "Mileage", "Average Pace", "Duration", "Finish"].map(
              (category) => {
                if (state.type === "overall" && category === "Finish")
                  return null;
                else return <option key={category}>{category}</option>;
              }
            )}
          </Form.Select>
        </FloatingLabel>
      </>
    );
  };

  const Mileage = () => {
    return (
      <FloatingLabel label="Miles">
        <Form.Control
          id="mileage"
          type="number"
          name="target"
          defaultValue={state.mileage}
          onBlur={handleBlur}
          className=""
        />
      </FloatingLabel>
    );
  };

  const Pace = () => {
    return (
      <InputGroup>
        {["minutes", "seconds"].map((type, i) => {
          return (
            <FloatingLabel key={type} label={type}>
              <Form.Control
                id={`pace-${type}`}
                type="number"
                name="target"
                step={type === "seconds" ? 5 : 1}
                defaultValue={
                  state.pace[type] && type === "seconds"
                    ? Math.round(state.pace[type])
                    : state.pace[type]
                }
                onBlur={handleBlur}
              />
            </FloatingLabel>
          );
        })}
      </InputGroup>
    );
  };

  const Duration = () => {
    return (
      <InputGroup>
        {["hours", "minutes", "seconds"].map((type, i) => {
          return (
            <FloatingLabel key={type} label={type}>
              <Form.Control
                id={`duration-${type}`}
                type="number"
                name="target"
                step={type === "seconds" ? 5 : 1}
                defaultValue={
                  state.duration.seconds && type === "seconds"
                    ? Math.round(state.duration[type])
                    : state.duration[type]
                }
                onBlur={handleBlur}
              />
            </FloatingLabel>
          );
        })}
      </InputGroup>
    );
  };

  const Target = () => {
    return {
      Mileage: <Mileage />,
      "Average Pace": <Pace />,
      Duration: <Duration />,
    }[state.category];
  };

  const GoalDate = () => {
    return (
      <>
        <Button
          id="add-goal-date"
          variant="outline-danger"
          onClick={handleClick}
          name="add"
          style={{ display: state.date ? "none" : "" }}
        >
          <BsPlusLg /> Complete By
        </Button>
        <FloatingLabel
          id="date-group"
          style={{ display: state.date ? "" : "none" }}
          label="Complete By"
        >
          <Form.Control
            id="goal-date"
            type="date"
            name="goal-date"
            value={state.date || ""}
            onChange={handleChange}
          />
        </FloatingLabel>
      </>
    );
  };

  useEffect(() => {
    const table = new Tabulator("#goal-table", {
      layout: "fitColumns",
      height: "100%",
      placeholder: "No Goals yet!",
      columns: [
        {
          title: "Type",
          field: "type",
          formatter: (cell) => startCase(cell.getValue()),
          visible: false,
        },
        {
          title: "Race / Team",
          field: "race",
          formatter: (cell) =>
            cell.getData().type === "race"
              ? cell.getValue()?.name || cell.getData()
              : "Overall",
        },
        {
          title: "Target",
          field: "target",
          mutator: (value, data) => data[data.category],
          formatter: (cell) => {
            console.log("value", cell.getValue());
            const { category } = cell.getRow().getData();
            if (category === "pace") {
              const { minutes, seconds } = cell.getValue();
              const value = DurationLux.fromObject({
                minutes,
                seconds,
              }).toFormat("m:ss");
              return `<b>${startCase(category)}:</b><br/> ${value}`;
            } else if (category === "duration") {
              const { hours, minutes, seconds } = cell.getValue();
              const value = DurationLux.fromObject({
                hours,
                minutes,
                seconds,
              }).toFormat("h:mm:ss");
              return `<b>${startCase(category)}:</b><br/> ${value}`;
            } else
              return `<b>${startCase(category)}:</b> <br/>${cell.getValue()}`;
          },
        },
        {
          title: "Progress",
          field: "progress",
          width: 150,
          mutator: (value, data) => {
            let { type, race, category, target } = data;
            console.log("progress target", target);
            if (type === "race") {
              if (!race) return 0;
              const { id } = race;
              const targetRace = participant.races.find((r) => r.id === id);
              console.log("targetRace", targetRace);
              if (!targetRace) {
                return renderToString(
                  <Row className="h-100 justify-content-center align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button variant="success" className="">
                        No Data
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              }
              if (category === "mileage") {
                return (targetRace.totalMileage / target) * 100;
              } else if (category === "pace") {
                console.log("pace mutator", category, targetRace.avgPace);
                const { minutes: currentMinutes, seconds: currentSeconds } =
                  targetRace.avgPace || {};
                if (!currentMinutes && !currentSeconds) return 0;
                const currentPace = DurationLux.fromObject({
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                }).shiftTo("seconds");
                delete target._id;
                const targetPace =
                  DurationLux.fromObject(target).shiftTo("seconds");
                console.log(
                  "currentPace",
                  currentPace,
                  "targetPace",
                  targetPace
                );
                const difference = currentPace.minus(targetPace);

                console.log("difference", difference);

                return difference.as("seconds");
              } else if (category === "duration") {
                const {
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                } = targetRace.totalDuration || {};
                if (!currentHours && !currentMinutes && !currentSeconds)
                  return 0;
                const currentDuration = DurationLux.fromObject({
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                }).as("seconds");
                delete target._id;
                const targetDuration =
                  DurationLux.fromObject(target).as("seconds");
                console.log(
                  "currentDuration",
                  currentDuration,
                  "targetDuration",
                  targetDuration
                );

                return (currentDuration / targetDuration) * 100;
              }
            } else {
              if (category === "mileage") {
                return (participant.totalMileage / target) * 100;
              } else if (category === "pace") {
                const { minutes: currentMinutes, seconds: currentSeconds } =
                  participant.avgPace || {};
                if (!currentMinutes && !currentSeconds) return 0;
                const currentPace = DurationLux.fromObject({
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                }).shiftTo("seconds");
                delete target._id;
                const targetPace =
                  DurationLux.fromObject(target).shiftTo("seconds");
                console.log(
                  "currentPace",
                  currentPace,
                  "targetPace",
                  targetPace
                );
                const difference = currentPace.minus(targetPace);

                console.log("difference", difference);

                return difference.as("seconds");
              } else if (category === "duration") {
                const {
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                } = participant.totalDuration || {};
                if (!currentHours && !currentMinutes && !currentSeconds)
                  return 0;
                const currentDuration = DurationLux.fromObject({
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                }).as("seconds");
                delete target._id;
                const targetDuration =
                  DurationLux.fromObject(target).as("seconds");
                console.log(
                  "currentDuration",
                  currentDuration,
                  "targetDuration",
                  targetDuration
                );

                return (currentDuration / targetDuration) * 100;
              }
            }
            return 0;
          },
          formatter: (cell) => {
            const { type, category, race, target } = cell.getRow().getData();
            let value = cell.getValue();
            if (type === "race") {
              if (!race) return;
              const { id } = race;
              const targetRace = participant.races.find((r) => r.id === id);
              console.log("targetRace", targetRace);
              if (!targetRace) {
                return renderToString(
                  <Row className="h-100 justify-content-center align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button variant="success" className="">
                        No Data
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              }
              if (category === "mileage") {
                const { totalMileage } = targetRace;
                value = value > 100 ? 100 : value;
                return renderToString(
                  <Row className="h-100 justify-content-center align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button
                        variant="success"
                        style={{ width: `${value}%` }}
                        className={
                          value === 0
                            ? "d-none"
                            : value === 100
                            ? "rounded"
                            : ""
                        }
                      >
                        {value > 66
                          ? `${totalMileage} / ${target}`
                          : value > 33
                          ? totalMileage
                          : ``}
                      </Button>
                      <Button
                        variant="danger"
                        style={{ width: `${100 - value}%` }}
                        className={
                          value === 100
                            ? "d-none"
                            : value === 0
                            ? "rounded"
                            : ""
                        }
                      >
                        {value > 66
                          ? ""
                          : value > 33
                          ? target
                          : `${totalMileage} / ${target}`}
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              } else if (category === "pace") {
                const difference = DurationLux.fromObject({ seconds: value })
                  .shiftTo("minutes", "seconds")
                  .toObject();
                console.log("pace difference", difference);
                const { minutes, seconds } = difference;
                const sign = minutes < 0 || seconds < 0 ? "- " : "+ ";
                return renderToString(
                  <Row className="justify-content-center h-100 align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button
                        variant={
                          minutes < 0 || seconds < 0 ? "success" : "danger"
                        }
                        style={{ width: `${Math.abs(value)}%` }}
                      >
                        {`${sign}${Math.abs(minutes)}m ${Math.abs(
                          seconds.toFixed(0)
                        )}s`}
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              } else if (category === "duration") {
                const { totalDuration } = targetRace;
                const {
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                } = totalDuration || {};
                const currentDuration = DurationLux.fromObject({
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                }).shiftTo("seconds");
                const targetDuration =
                  DurationLux.fromObject(target).shiftTo("seconds");

                const difference = currentDuration.minus(targetDuration);

                const { hours, minutes, seconds } = difference
                  .shiftTo("hours", "minutes", "seconds")
                  .toObject();

                const sign = minutes >= 0 ? "+" : "-";
                return renderToString(
                  <Row className="justify-content-center h-100 align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button
                        variant={minutes < 0 ? "danger" : "success"}
                        style={{ width: `${Math.abs(value)}%` }}
                      >
                        {sign}
                        {hours ? `${Math.abs(hours)}h ` : ""}
                        {minutes ? `${Math.abs(minutes)}m ` : ""}
                        {`${Math.abs(seconds.toFixed(0))}s`}
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              }
            } else {
              if (category === "mileage") {
                const { totalMileage } = participant;
                value = value > 100 ? 100 : value;
                console.log("mileage value", value);
                return renderToString(
                  <Row className="h-100 justify-content-center align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button
                        variant="success"
                        style={{ width: `${value}%` }}
                        className={
                          value === 0
                            ? "d-none"
                            : value === 100
                            ? "rounded"
                            : ""
                        }
                      >
                        {value > 66
                          ? `${totalMileage} / ${target}`
                          : value > 33
                          ? totalMileage
                          : ``}
                      </Button>
                      <Button
                        variant="danger"
                        style={{ width: `${100 - value}%` }}
                        className={
                          value === 100
                            ? "d-none"
                            : value === 0
                            ? "rounded"
                            : ""
                        }
                      >
                        {value > 66
                          ? ""
                          : value > 33
                          ? target
                          : `${totalMileage} / ${target}`}
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              } else if (category === "pace") {
                const difference = DurationLux.fromObject({ seconds: value })
                  .shiftTo("minutes", "seconds")
                  .toObject();
                console.log("pace difference", difference);
                const { minutes, seconds } = difference;
                const sign = minutes < 0 || seconds < 0 ? "- " : "+ ";
                return renderToString(
                  <Row className="justify-content-center h-100 align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button
                        variant={
                          minutes < 0 || seconds < 0 ? "success" : "danger"
                        }
                        style={{ width: `${Math.abs(value)}%` }}
                      >
                        {`${sign}${Math.abs(minutes)}m ${Math.abs(
                          seconds.toFixed(0)
                        )}s`}
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              } else if (category === "duration") {
                const {
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                } = participant.totalDuration || {};
                const currentDuration = DurationLux.fromObject({
                  hours: currentHours,
                  minutes: currentMinutes,
                  seconds: currentSeconds,
                }).shiftTo("seconds");
                const targetDuration =
                  DurationLux.fromObject(target).shiftTo("seconds");

                const difference = currentDuration.minus(targetDuration);

                const { hours, minutes, seconds } = difference
                  .shiftTo("hours", "minutes", "seconds")
                  .toObject();

                const sign = minutes >= 0 ? "+" : "-";
                return renderToString(
                  <Row className="justify-content-center h-100 align-items-center">
                    <ButtonGroup className="progress-button">
                      <Button
                        variant={minutes < 0 ? "danger" : "success"}
                        style={{ width: `${Math.abs(value)}%` }}
                      >
                        {sign}
                        {hours ? `${Math.abs(hours)}h ` : ""}
                        {minutes ? `${Math.abs(minutes)}m ` : ""}
                        {`${Math.abs(seconds.toFixed(0))}s`}
                      </Button>
                    </ButtonGroup>
                  </Row>
                );
              }
            }
          },
        },
        { title: "Category", field: "category", visible: false },
        { title: "Mileage", field: "mileage", visible: false },
        { title: "Pace", field: "pace", visible: false },
        { title: "Duration", field: "duration", visible: false },
        { title: "Date", field: "date", visible: false },
      ],
    });
    table.on("tableBuilt", () => {
      console.log("goals table built");
      table.setData(participant.goals);
    });
  }, [participant]);

  return (
    <>
      <Form id="goal-form" onClick={handleClick} className="mb-3">
        <Row id="goal-row-1" className=" ">
          <Col xs={2} className="d-flex justify-content-start">
            <h2 className="styled-title goal-number">1</h2>
          </Col>
          <Col xs={10} className="d-flex align-items-center">
            <ButtonGroup
              id="goal-type"
              name="type"
              className="w-75"
              onClick={handleChange}
            >
              {["overall", "race"].map((type, i) => {
                return (
                  <Button
                    key={type}
                    id={`goal-${type}`}
                    value={type}
                    variant="danger"
                    type="radio"
                    name="type"
                    className={state.type === type ? "active" : ""}
                  >
                    {`${startCase(type)}${type === "race" ? " / Team" : ""}`}
                  </Button>
                );
              })}
            </ButtonGroup>
          </Col>
        </Row>
        {[2, 3, 4].map((i) => {
          const race = state.type === "race";
          return (
            <Row key={i} id={`goal-row-${i}`} className=" ">
              <Col xs={2} className="d-flex justify-content-start">
                <h2 className="styled-title goal-number">{i}</h2>
              </Col>
              <Col xs={10}>
                {i === 2 ? (
                  race ? (
                    <Race />
                  ) : (
                    <Category />
                  )
                ) : i === 3 ? (
                  race ? (
                    <Category />
                  ) : (
                    <Target />
                  )
                ) : i === 4 ? (
                  race ? (
                    <Target />
                  ) : (
                    <GoalDate />
                  )
                ) : (
                  <GoalDate />
                )}
              </Col>
            </Row>
          );
        })}
        <Row
          id="add-goal-row"
          className=""
          style={{
            display: state.category || state.type === "none" ? "flex" : "none",
            opacity: state.category || state.type === "none" ? 1 : 0,
          }}
        >
          <Col
            xs={12}
            className="d-flex justify-content-start align-items-center"
          >
            <Button
              variant="danger"
              id="add-goal"
              name="add"
              onClick={handleClick}
            >
              <BsPlusLg size="0.8em" className="me-2" />{" "}
              {state.category ? "Add" : "New"} Goal
            </Button>
            <Button
              variant="danger"
              id="reset-goal"
              name="reset"
              className="ms-3"
              onClick={handleClick}
              style={{ display: state.category ? "inline-block" : "none" }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Form>
      <Row id="goal-table-row" className="mt-5">
        <Col>
          <div id="goal-table" className="mt-5" />
        </Col>
      </Row>
    </>
  );
};

export default Goals;
