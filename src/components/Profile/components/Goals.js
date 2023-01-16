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
import { Tabulator } from "tabulator-tables";
// import { AppContext } from "../../../App.js";
import { DateTime } from "luxon";
// import {
//   Race,
//   Category,
//   Mileage,
//   Pace,
//   Duration,
//   Target,
//   GoalDate,
// } from "./GoalInputs.js";

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
  // const [Context, setContext] = useContext(AppContext);
  // const { participant } = Context;

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

  const hideRow = (rows) => {
    rows = typeof rows === "number" ? [rows] : rows;
    rows.forEach(async (row) => {
      $(`#goal-row-${row}`).css({ marginLeft: 2000, opacity: 0 });
      setTimeout(() => {
        $(`#goal-row-${row}`).hide();
      }, 500);
    });
  };

  const showRow = (rows) => {
    rows = typeof rows === "number" ? [rows] : rows;
    rows.forEach(async (row) => {
      $(`#goal-row-${row}`).css({ display: "flex" });
      setTimeout(() => {
        $(`#goal-row-${row}`).css({ marginLeft: 0, opacity: 1 });
      }, 0);
    });
  };

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
          growForm(75);
        }
        resetState(value);
        hideRow([3, 4]);
        $("#goal-form").height(200);
        break;
      case "race":
      case "category":
        if (!state[name] || (name === "category" && state[name] === "Finish"))
          growForm(75);
        setState((prevState) => ({
          ...prevState,
          [name]: value,
        }));
        if (!state.race) {
          //overall
          showRow(3);
        } else if (name === "category" && value === "Finish") {
          hideRow([4, 5]);
        } else {
          showRow([4, 5]);
        }
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

  const handleBlur = (e) => {
    e.preventDefault();
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

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { type, id } = e.target;
    if (type === "number") {
      e.target.select();
    } else if (id === "add-goal") {
      if (!state.category) {
        resetState();
        showRow(1);
        $("#reset-goal").css({ display: "block" });
        setTimeout(() => {
          $("#reset-goal").css({ opacity: 1 });
        }, 0);
      }
    } else if (id === "add-goal-date") {
      console.log(e.target);
      $(e.target).toggle();
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
    // new Tabulator("#goal-table", {
    //   layout: "fitColumns",
    //   columns: [
    //     { title: "Type", field: "type" },
    //     { title: "Race" },
    //     { title: "Category", field: "category" },
    //     { title: "Target", field: "target" },
    //   ],
    // });
  }, []);

  return (
    <>
      <Form id="goal-form" onClick={handleClick} className="mb-3">
        <Row id="goal-row-1" className=" ">
          <Col xs={2} md={1} className="d-flex justify-content-start">
            <h2 className="styled-title goal-number">1</h2>
          </Col>
          <Col xs={10} md={11} className="d-flex align-items-center">
            <ButtonGroup
              id="goal-type"
              name="type"
              className="w-25"
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
                    {startCase(type)}
                  </Button>
                );
              })}
            </ButtonGroup>
          </Col>
        </Row>
        {[2, 3, 4, 5].map((i) => {
          const race = state.type === "race";
          return (
            <Row key={i} id={`goal-row-${i}`} className=" ">
              <Col xs={2} md={1} className="d-flex justify-content-start">
                <h2 className="styled-title goal-number">{i}</h2>
              </Col>
              <Col xs={10} md={11}></Col>
            </Row>
          );
        })}
        {/* <GoalDate /> */}
        <Button
          id="add-goal-date"
          variant="outline-danger"
          onClick={handleClick}
          name="add"
          style={{
            display: state.category || state.type === 'none'  ? "block" : "none",
            opacity: state.category || state.type === 'none'? 1 : 0,
          }}
        >
          <BsPlusLg /> Complete By
        </Button>
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
      {/* <div id="goal-table" className="mt-5" /> */}
    </>
  );
};

export default Goals;
