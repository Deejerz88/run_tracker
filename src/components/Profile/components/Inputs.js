import { useEffect, useState, useContext } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Accordion,
  InputGroup,
  FloatingLabel,
  FormLabel,
} from "react-bootstrap";
import { DateTime } from "luxon";
import { startCase } from "lodash";
import { handleChange, handleSubmit } from "../utils/index.js";
import { AppContext } from "../../../App.js";
import axios from "axios";
import $ from "jquery";

const Inputs = ({ state, setState, handleClose }) => {
  const [activeKey, setActiveKey] = useState("in");
  const [races, setRaces] = useState([]);
  const [Context, setContext] = useContext(AppContext);
  const [selectedRace, setSelectedRace] = useState(Context.race);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(Context.date);
  const { participant } = Context;
  const [showGroup, setShowGroup] = useState({});

  const today = DateTime.local().toISODate();

  useEffect(() => {
    (async () => {
      let { data: races } = await axios.get("/race");
      setRaces(["", ...races]);
    })();
  }, []);

  useEffect(() => {
    console.log("checkedIn", checkedIn);
  }, [checkedIn]);

  useEffect(() => {
    if (!races.length > 1) return;
    console.log("changing race", races, races[1], Context);
    setSelectedRace(Context.race.name ? Context.race : races[1]);
  }, [races, Context]);

  useEffect(() => {
    console.log("selectedRace", selectedRace);
    if (!selectedRace || !participant.races) return;
    const participantRace = participant.races.find(
      (r) => r.id === selectedRace.id
    );
    console.log("participantRace", participantRace);
    if (!participantRace || !participantRace.attendance) return;
    const todaysEvent = participantRace.attendance.find(
      (a) => a.date === selectedDate
    );
    console.log("todaysEvent", todaysEvent);
    setCheckedIn(todaysEvent?.checkedIn || false);
  }, [participant.races, selectedDate, selectedRace]);

  useEffect(() => {
    setActiveKey(checkedIn ? "out" : "in");
  }, [checkedIn]);

  useEffect(() => {
    console.log("inputs state", state);
  }, [state]);

  const handleClick = (e) => {
    e.stopPropagation();
    const { name, type, classList } = e.target;
    console.log("name", name, e.target);
    const expanded = e.target.getAttribute("aria-expanded");
    console.log("expanded", typeof expanded, type);
    console.log("clicked", e.target);
    if (e.target.type === "number") {
      e.target.select();
    } else if (type === "button" && expanded === "false") {
      console.log("clicked header", activeKey);
      setActiveKey(activeKey === "in" ? "out" : "in");
    } else if (classList.contains("add-group")) {
      $(`.${name}`).toggleClass("hidden");
      setShowGroup({ ...showGroup, [name]: !showGroup[name] });
    }
  };
  useEffect(() => {
    console.log("showGroup", showGroup);
  }, [showGroup]);

  return (
    <Form
      id="checkInOut-form"
      onSubmit={(e) =>
        handleSubmit({
          e,
          state,
          setState,
          participant,
          selectedRace,
          handleClose,
          selectedDate,
          setContext,
          checkedIn,
          setCheckedIn,
          showGroup,
          setShowGroup,
        })
      }
      onClick={handleClick}
      className="bg-light"
    >
      <Row id="checkin-race-row">
        <Col>
          <FloatingLabel label="Race" className="m-3">
            <Form.Select
              id="checkin-race"
              value={selectedRace?.name || ""}
              onChange={(e) =>
                handleChange({
                  e,
                  setContext,
                  races,
                  setSelectedRace,
                })
              }
            >
              {races.map((race, i) => (
                <option key={i}>{race.name}</option>
              ))}
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col>
          <FloatingLabel label="Date" className="m-3">
            <Form.Control
              id="checkin-date"
              type="date"
              value={selectedDate || today}
              onChange={(e) => handleChange({ e, setContext, setSelectedDate })}
            />
          </FloatingLabel>
        </Col>
      </Row>
      <Accordion
        id="checkInOut"
        activeKey={activeKey}
        onSelect={(val) => setActiveKey(val)}
        name={activeKey}
      >
        <Accordion.Item eventKey="in">
          <Accordion.Header name="header-in" onClick={handleClick}>
            Check In
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col xs={6}>
                <InputGroup className="mb-3">
                  <FloatingLabel label="Start Time">
                    <Form.Control
                      id="start-time"
                      type="time"
                      value={
                        state.start
                          ? DateTime.fromMillis(state.start).toFormat("HH:mm")
                          : DateTime.now().toFormat("HH:mm")
                      }
                      onChange={(e) => handleChange({ e, state, setState })}
                      name="in"
                    />
                  </FloatingLabel>
                </InputGroup>
              </Col>
              <Col xs={6}>
                <FloatingLabel label="Estimated Return">
                  <Form.Control
                    id="finish-target"
                    type="time"
                    value={
                      state.finish
                        ? DateTime.fromMillis(state.finish).toFormat("HH:mm")
                        : DateTime.now()
                            .plus({
                              minutes: state.duration.minutes,
                              seconds: state.duration.seconds,
                            })
                            .toFormat("HH:mm")
                    }
                    onChange={(e) => handleChange({ e, state, setState })}
                    name="in"
                  />
                </FloatingLabel>
              </Col>
              {state.duration.hours >= 1 && (
                <Form.Check
                  type="checkbox"
                  id="acknowledged"
                  label="I will be back after training ends and understand there may
                not be any coaching support present"
                  inline
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      acknowledged: e.target.checked,
                    }))
                  }
                />
              )}
            </Row>

            <Row>
              <Col xs={6}>
                <Row className="mileage hidden">
                  <FormLabel>Mileage</FormLabel>
                  <InputGroup className="mb-3">
                    <FloatingLabel label="Target">
                      <Form.Control
                        id="mileage-target"
                        type="number"
                        step={0.1}
                        placeholder="Target Mileage"
                        value={state.mileage?.toFixed(1) || 3}
                        onChange={(e) => handleChange({ e, state, setState })}
                        name="in"
                      />
                    </FloatingLabel>
                  </InputGroup>
                </Row>
              </Col>
            </Row>

            <Row className="mb-3 checkIn-row">
              {["pace", "duration"].map((group, i) => (
                <Col key={group} name={group} className={`${group} hidden`}>
                  <FormLabel>{startCase(group)}</FormLabel>
                  <InputGroup className="mb-3">
                    {["hours", "minutes", "seconds"].map((type, i) => {
                      if (group === "pace" && type === "hours") return null;
                      else
                        return (
                          <FloatingLabel key={type} label={type}>
                            <Form.Control
                              id={`${group}-${type}`}
                              type="number"
                              step={type === "seconds" ? 5 : 1}
                              value={
                                type === "seconds"
                                  ? Math.round(state[group][type])
                                  : state[group][type]
                              }
                              onChange={(e) =>
                                handleChange({ e, state, setState })
                              }
                              name="in"
                            />
                          </FloatingLabel>
                        );
                    })}
                  </InputGroup>
                </Col>
              ))}
            </Row>
            <Row>
              <Col className='p-0' xs={4}>
                <Button
                  variant="outline-danger"
                  name="mileage"
                  onClick={handleClick}
                  className={`${
                    showGroup.mileage ? "active" : ''
                  } add-group`}
                >
                  Mileage
                </Button>
              </Col>
              <Col xs={4}>
                <Button
                  variant="outline-danger"
                  name="pace"
                  className={`${showGroup.pace ? "active" : ''} ${
                    showGroup.mileage ? "" : "hidden "
                  } add-group`}
                  onClick={handleClick}
                >
                  Pace
                </Button>
              </Col>
              <Col xs={4}>
                <Button
                  variant="outline-danger"
                  name="duration"
                  className={`${showGroup.duration ? "active" : ''} ${
                    showGroup.mileage ? "" : "hidden "
                  } add-group`}
                  onClick={handleClick}
                >
                  Duartion
                </Button>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="out">
          <Accordion.Header name="header-out" onClick={handleClick}>
            Check Out
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col xs={6}>
                <InputGroup className="mb-3">
                  <FloatingLabel label="Start Time">
                    <Form.Control
                      id="start"
                      type="time"
                      value={
                        state.start
                          ? DateTime.fromMillis(state.start).toFormat("HH:mm")
                          : DateTime.now().toFormat("HH:mm")
                      }
                      onChange={(e) => handleChange({ e, state, setState })}
                      name="out"
                    />
                  </FloatingLabel>
                </InputGroup>
              </Col>
              <Col xs={6}>
                <FloatingLabel label="Return Time">
                  <Form.Control
                    id="finish-actual"
                    type="time"
                    className="mb-3"
                    value={
                      state.finish
                        ? DateTime.fromMillis(state.finish).toFormat("HH:mm")
                        : DateTime.now()
                            .plus({
                              minutes: state.duration.minutes,
                              seconds: state.duration.seconds,
                            })
                            .toFormat("HH:mm")
                    }
                    onChange={(e) => handleChange({ e, state, setState })}
                    name="out"
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row className="checkIn-row mileage hidden">
              <Col xs={6}>
                <FormLabel>Mileage</FormLabel>
                <InputGroup className="mb-3">
                  <FloatingLabel label="Actual">
                    <Form.Control
                      id="mileage-actual"
                      type="number"
                      step={0.1}
                      value={state.mileage?.toFixed(1) || 3}
                      onChange={(e) => handleChange({ e, state, setState })}
                      name="out"
                    />
                  </FloatingLabel>
                </InputGroup>
              </Col>
            </Row>
            <Row className="checkIn-row">
              {["pace", "duration"].map((group, i) => (
                <Col key={group} className={`${group} hidden`}>
                  <FormLabel>{startCase(group)}</FormLabel>
                  <InputGroup className="mb-3">
                    {["hours", "minutes", "seconds"].map((type, i) => {
                      if (group === "pace" && type === "hours") return null;
                      return (
                        <FloatingLabel key={type} label={type}>
                          <Form.Control
                            id={`${group}-${type}-out`}
                            type="number"
                            step={type === "seconds" ? 5 : 1}
                            value={
                              type === "seconds"
                                ? Math.round(state[group][type])
                                : state[group][type]
                            }
                            onChange={(e) =>
                              handleChange({ e, state, setState })
                            }
                            name="out"
                          />
                        </FloatingLabel>
                      );
                    })}
                  </InputGroup>
                </Col>
              ))}
            </Row>
            <Row>
              <Col xs={4}>
                <Button
                  variant="outline-danger"
                  name="mileage"
                  onClick={handleClick}
                  className={`${
                    showGroup.mileage ? "active" : ''
                  } add-group`}
                >
                  Mileage
                </Button>
              </Col>
              <Col xs={4}>
                <Button
                  variant="outline-danger"
                  name="pace"
                  className={`${showGroup.pace ? "active" : ''} ${
                    showGroup.mileage ? "" : "hidden "
                  } add-group`}
                  onClick={handleClick}
                >
                  Pace
                </Button>
              </Col>
              <Col xs={4}>
                <Button
                  variant="outline-danger"
                  name="duration"
                  className={`${showGroup.duration ? "active" : ""} ${
                    showGroup.mileage ? "" : "hidden "
                  } add-group`}
                  onClick={handleClick}
                >
                  Duartion
                </Button>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <Row id="checkin-buttons">
        <Button
          id="checkinout-button"
          variant="outline-danger"
          name={activeKey}
          type="submit"
          className=" m-3"
        >
          {activeKey === "in" ? "Check In" : "Check Out"}
        </Button>

        <Form.Check
          type="switch"
          id="default-fields"
          label="Default Fields"
          className="align-self-center "
          onChange={handleClick}
          inline
        />
      </Row>
    </Form>
  );
};

export default Inputs;
