import { useEffect, useState } from "react";
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
import { startCase, isEqual } from "lodash";
import { handleChange, handleSubmit } from "../utils/index.js";
import $ from "jquery";

const Inputs = ({ state, setState, Context, setContext, races }) => {
  const [activeKey, setActiveKey] = useState("in");
  const [selectedRace, setSelectedRace] = useState(Context.race);
  const [selectedDate, setSelectedDate] = useState(Context.date);
  const [checkedIn, setCheckedIn] = useState(false);
  const [showGroup, setShowGroup] = useState({
    mileage: true,
    pace: true,
    duration: true,
  });
  const { participant } = Context;
  const [defaults, setDefaults] = useState(participant.settings?.defaultFields);
  const today = DateTime.local().toISODate();

  useEffect(() => {
    console.log("state", state);
  }, [state]);

  useEffect(() => {
    setState({
      mileage: 3,
      pace: {
        minutes: 10,
        seconds: 0,
      },
      duration: {
        hours: 0,
        minutes: 30,
        seconds: 0,
      },
      start: null,
      finish: null,
    });
  }, [setState]);

  useEffect(() => {
    if (!participant.settings?.defaultFields) return;
    let groups = {};
    participant.settings?.defaultFields.forEach((field) => {
      groups[field] = true;
    });

    setShowGroup(groups);
  }, [participant.settings?.defaultFields]);

  useEffect(() => {
    if (!races?.length > 1) return;
    //change selected race & date when context changes
    setSelectedRace(Context.race.name ? Context.race : races[1]);
    setSelectedDate(Context.date || today);
    setShowGroup({ mileage: true, pace: true, duration: true });
  }, [races, today, Context.race, Context.date]);

  useEffect(() => {
    //check if participant has checked in
    if (!selectedRace || !participant.races) return;
    const participantRace = participant.races?.find(
      (r) => r.id === selectedRace.id
    );

    if (!participantRace || !participantRace.attendance) return;
    const todaysEvent = participantRace.attendance.find(
      (a) => a.date === selectedDate
    );

    setCheckedIn(todaysEvent?.checkedIn || false);
  }, [participant.races, selectedDate, selectedRace]);

  useEffect(() => {
    setActiveKey(checkedIn ? "out" : "in");
  }, [checkedIn]);

  const handleClick = (e) => {
    e.stopPropagation();
    const { name, type, classList, id } = e.target;
    const expanded = e.target.getAttribute("aria-expanded");

    if (e.target.type === "number") {
      e.target.select();
    } else if (type === "button" && expanded === "false") {
      //toggle accordion
      setActiveKey(activeKey === "in" ? "out" : "in");
    } else if (classList.contains("add-group")) {
      if (name === "mileage" && showGroup.mileage) {
        //hide all groups
        ["mileage", "pace", "duration"].forEach((group) =>
          $(`.${group}`).addClass("hidden")
        );
        setShowGroup({});
      } else {
        //show group {mileage: true, pace: false, duration: true}
        $(`.${name}`).toggleClass("hidden"); // name: mileage, pace, duration
        setShowGroup({ ...showGroup, [name]: !showGroup[name] }); //toggle group
      }
    } else if (id === "default-fields") {
      if (e.target.checked)
        setDefaults(Object.keys(showGroup).filter((g) => showGroup[g]));
    }
  };

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
      onKeyDown={(e) => {
        console.log("key pressed", e.key);
        if (e.key === "Enter") {
          //trigger tab event on enter key
          console.log("enter pressed");
          e.preventDefault();
          console.log("next", $(e.target).next(".form-control"));
          $(e.target).next().trigger("focus");
        }
      }}
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
              {races?.map((r, i) => (
                <option key={i} value={r.name || ""} className={r}>
                  {r.name}
                </option>
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
                  { startFinish: "start", label: "Start Time" },
                  { startFinish: "finish", label: "End Time" },
                ].map(({ startFinish, label }) => {
                  const now = DateTime.local();
                  delete state.duration?._id;
                  return (
                    <Col xs={6} key={startFinish}>
                      <FloatingLabel label={label}>
                        <Form.Control
                          id={`${startFinish}-time-${inOut}`}
                          type="time"
                          value={
                            state[startFinish]
                              ? DateTime.fromMillis(
                                  state[startFinish]
                                ).toFormat("HH:mm")
                              : startFinish === "finish"
                              ? DateTime.fromMillis(
                                  state.start || now.toMillis()
                                )
                                  .plus(state.duration || { minutes: 30 })
                                  .toFormat("HH:mm")
                              : now.toFormat("HH:mm")
                          }
                          onChange={(e) => handleChange({ e, state, setState })}
                          name={inOut}
                        />
                      </FloatingLabel>
                    </Col>
                  );
                })}
                <Form.Check id='no-wait' type="checkbox" label="Do not wait for me" inline className="ms-3" />
                {/* {state.duration?.hours >= 1 && (
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
                )} */}
              </Row>
              <Row>
                <Col xs={6}>
                  <Row
                    className={`${showGroup.mileage ? "" : "hidden"} mileage`}
                  >
                    <FormLabel>Mileage</FormLabel>
                    <InputGroup className="mb-3">
                      <FloatingLabel label="Target">
                        <Form.Control
                          id={`mileage-target-${inOut}`}
                          type="number"
                          step={0.1}
                          value={state.mileage || 3}
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
                  <Col
                    key={group}
                    name={group}
                    className={`${group} ${showGroup[group] ? "" : "hidden"}`}
                  >
                    <FormLabel>{startCase(group)}</FormLabel>
                    <InputGroup className="mb-3">
                      {["hours", "minutes", "seconds"].map((type, i) => {
                        if (group === "pace" && type === "hours") return null;
                        else
                          return (
                            <FloatingLabel key={type} label={type}>
                              <Form.Control
                                id={`${group}-${type}-${inOut}`} // pace-minutes-in, etc.
                                type="number"
                                step={type === "seconds" ? 5 : 1}
                                value={
                                  type === "seconds"
                                    ? (state[group] &&
                                        Math.round(state[group][type])) ||
                                      0
                                    : (state[group] && state[group][type]) || 0
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
          checked={
            //check if defaults are same as showGroup
            isEqual(
              Object.keys(showGroup).filter((g) => showGroup[g]), // filter out false values
              defaults
            )
          }
          onChange={handleClick}
          inline
        />
      </Row>
    </Form>
  );
};

export default Inputs;
