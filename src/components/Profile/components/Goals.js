import { useEffect, useState } from "react";
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

const Goals = () => {
  const [state, setState] = useState({
    type: "none",
    event: "",
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
  });
  const [races, setRaces] = useState([]);

  const resetState = (type) => {
    setState({
      type: type || "",
      event: "",
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
    });
  };

  const hideRow = (row) => {
    $(`#goal-row-${row}`).css({ marginLeft: 2000, opacity: 0 });
    setTimeout(() => {
      $(`#goal-row-${row}`).hide();
    }, 500);
  };

  const showRow = (row) => {
    $(`#goal-row-${row}`).css({ display: "flex" });
    setTimeout(() => {
      $(`#goal-row-${row}`).css({ marginLeft: 0, opacity: 1 });
    }, 0);
  };

  const growForm = (size) => {
    $("#goal-form").height($("#goal-form").height() + size);
  };

  const handleSelect = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    console.log("name", name, e.target, value);
    switch (name) {
      case "type":
        if (state.type === "none" || !state.type) {
          showRow(2);
          growForm(75);
        }
        resetState(value);
        hideRow(3);
        hideRow(4);
        $("#goal-form").height(200);
        break;
      case "event":
      case "category":
        if (!state[name] || (name === "category" && state[name] === "Finish"))
          growForm(75);
        setState((prevState) => ({
          ...prevState,
          [name]: value,
        }));
        console.log("state event", state.event);
        if (!state.event) {
          showRow(3);
        } else if (name !== "event") {
          if (value === "Finish") {
            hideRow(4);
          } else {
            showRow(4);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleBlur = (e) => {
    e.preventDefault();
    const { name, id, value } = e.target;
    const [group, field] = id.split("-");
    console.log("name", name, group, field, value);
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

  const handleClick = (e) => {
    e.preventDefault();
    const { name, type } = e.target;
    if (type === "number") {
      e.target.select();
      return;
    }
    if (name === "add") {
      console.log("add goal", state);
      // $("#add-goal-row").hide().css({ opacity: 0 });
      resetState();
      showRow(1);
      $("#reset-goal").css({ display: "block" });
      setTimeout(() => {
        $("#reset-goal").css({ opacity: 1 });
      }, 0);
    } else if (name === "reset") {
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

  useEffect(() => {
    console.log("state", state);
  }, [state]);

  const Event = () => {
    const raceList = ["", ...races];
    return (
      <InputGroup className="">
        <FloatingLabel label="Event">
          <Form.Select
            id="goal-event"
            name="event"
            value={state.event}
            onChange={handleSelect}
          >
            {raceList.map((race, i) => (
              <option key={i}>{race.name}</option>
            ))}
          </Form.Select>
        </FloatingLabel>
      </InputGroup>
    );
  };

  const Category = () => {
    return (
      <InputGroup className=" ">
        <FloatingLabel label="Category">
          <Form.Select
            id="goal-category"
            name="category"
            value={state.category}
            onChange={handleSelect}
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
      </InputGroup>
    );
  };

  const Mileage = () => {
    return (
      // <InputGroup className="">
      <FloatingLabel label="Miles">
        <Form.Control
          id="mileage"
          type="number"
          name="target"
          value={state.mileage}
          onChange={handleSelect}
          className=""
        />
      </FloatingLabel>
      // </InputGroup>
    );
  };

  const Pace = () => {
    return (
      <InputGroup className="">
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
      <InputGroup className="">
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

  return (
    <Form id="goal-form" onClick={handleClick}>
      <Row id="goal-row-1" className=" ">
        <Col xs={2} className="d-flex justify-content-start">
          <h2 className="styled-title goal-number">1</h2>
        </Col>
        <Col xs={10} className="d-flex align-items-center">
          <ButtonGroup
            id="goal-type"
            name="type"
            className="w-25"
            onClick={handleSelect}
          >
            {["overall", "event"].map((type, i) => {
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
                  {startCase(type)}
                </Button>
              );
            })}
          </ButtonGroup>
        </Col>
      </Row>
      {[2, 3, 4].map((i) => {
        const event = state.type === "event";
        return (
          <Row key={i}  id={`goal-row-${i}`} className=" ">
            <Col xs={2} className="d-flex justify-content-start">
              <h2 className="styled-title goal-number">{i}</h2>
            </Col>
            <Col xs={10}>
              {i === 2 ? (
                event ? (
                  <Event />
                ) : (
                  <Category />
                )
              ) : i === 3 ? (
                event ? (
                  <Category />
                ) : (
                  <Target />
                )
              ) : (
                <Target />
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
  );
};

export default Goals;
