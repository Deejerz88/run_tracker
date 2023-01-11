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
  const [defaults, setDefaults] = useState([]);

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
    const { name, type, classList, id } = e.target;
    console.log("name", name, e.target);
    const expanded = e.target.getAttribute("aria-{expanded");
    console.log("expanded", typeof expanded, type);
    console.log("clicked", e.target);
    if (e.target.type === "number") {
      e.target.select();
    } else if (type === "button" && expanded === "false") {
      console.log("clicked header", activeKey);
      setActiveKey(activeKey === "in" ? "out" : "in");
    } else if (classList.contains("add-group")) {
      if (name === "mileage" && showGroup.mileage) {
        ["mileage", "pace", "duration"].forEach((group) =>
          $(`.${group}`).addClass("hidden")
        );
        setShowGroup({});
      } else {
        $(`.${name}`).toggleClass("hidden");
        setShowGroup({ ...showGroup, [name]: !showGroup[name] });
      }
      if (!defaults.includes(name)) $("#default-fields").prop("checked", false);
    } else if (id === "default-fields") {
      console.log("default fields", e.target.checked);
      if (e.target.checked)
        setDefaults(Object.keys(showGroup).filter((g) => showGroup[g]));
    }
  };
  useEffect(() => {
    console.log("showGroup", showGroup);
  }, [showGroup]);

  useEffect(() => {
    console.log("defaults", defaults);
  }, [defaults]);

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
          defaults,
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
        {[
          { inOut: "in", label: "Check In" },
          { inOut: "out", label: "Check Out" },
        ].map(({ inOut, label }) => (
          <Accordion.Item eventKey={inOut} key={inOut}>
            <Accordion.Header name={`header-${inOut}`} onClick={handleClick}>
              {label}
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                {[
                  { startfinish: "start", label: "Start Time" },
                  { startfinish: "finish", label: "End Time" },
                ].map(({ startfinish, label }) => (
                  <Col xs={6} key={startfinish}>
                    <FloatingLabel label={label}>
                      <Form.Control
                        id={`${startfinish}-time-${inOut}`}
                        type="time"
                        value={
                          state[startfinish]
                            ? DateTime.fromMillis(state[startfinish]).toFormat(
                                "HH:mm"
                              )
                            : DateTime.now().toFormat("HH:mm")
                        }
                        onChange={(e) => handleChange({ e, state, setState })}
                        name={inOut}
                      />
                    </FloatingLabel>
                  </Col>
                ))}
                {state.duration.hours >= 1 && (
                  <Form.Check
                    type="checkbox"
                    id={`acknowledged--${inOut}`}
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
                  <Row className={`hidden mileage`}>
                    <FormLabel>Mileage</FormLabel>
                    <InputGroup className="mb-3">
                      <FloatingLabel label="Target">
                        <Form.Control
                          id={`mileage-target-${inOut}`}
                          type="number"
                          step={0.1}
                          value={state.mileage?.toFixed(1) || 3}
                          onChange={(e) => handleChange({ e, state, setState })}
                          name={inOut}
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
                                id={`${group}-${type}-${inOut}`}
                                type="number"
                                step={type === "seconds" ? 5 : 1}
                                value={
                                  type === "seconds"
                                    ? Math.round(state[group][type]) || 0
                                    : state[group][type] || 0
                                }
                                onChange={(e) =>
                                  handleChange({ e, state, setState })
                                }
                                name={inOut}
                              />
                            </FloatingLabel>
                          );
                      })}
                    </InputGroup>
                  </Col>
                ))}
              </Row>
              <Row>
                {["mileage", "pace", "duration"].map((group, i) => {
                  const hidden =
                    group === "mileage"
                      ? ""
                      : !showGroup.mileage
                      ? "hidden"
                      : "";
                  return (
                    <Col key={group} xs={4}>
                      <Button
                        variant="outline-danger"
                        onClick={handleClick}
                        name={group}
                        className={`add-group ${
                          showGroup[group] ? "active" : ""
                        } ${hidden}`}
                      >
                        {startCase(group)}
                      </Button>
                    </Col>
                  );
                })}
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        ))}
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
          defaultChecked="true"
          onChange={handleClick}
          inline
        />
      </Row>
    </Form>
  );
};

export default Inputs;
