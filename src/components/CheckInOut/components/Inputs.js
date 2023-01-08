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
import { UserContext } from "../../../App.js";

const Inputs = ({
  state,
  setState,
  checkedIn,
  participant,
  race,
  table,
  handleClose,
  date,
}) => {
  const [activeKey, setActiveKey] = useState("in");

  const User = useContext(UserContext);

  useEffect(() => {
    setActiveKey(checkedIn ? "out" : "in");
  }, [checkedIn]);

  useEffect(() => {
    console.log("inputs state", state);
  }, [state]);

  const handleClick = (e) => {
    if (e.target.type === "number") {
      e.target.select();
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
          race,
          table,
          handleClose,
          date,
          User,
        })
      }
      onClick={handleClick}
    >
      <Accordion
        id="checkInOut"
        defaultActiveKey={checkedIn ? "out" : "in"}
        onSelect={(val) => setActiveKey(val)}
        name={activeKey}
      >
        <Accordion.Item eventKey="in">
          <Accordion.Header>Check In</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col xs={6}>
                <InputGroup className="mb-3">
                  <FloatingLabel label="Target Mileage">
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
              </Col>
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
            </Row>
            <Row className="mb-3 checkIn-row">
              {["pace", "duration"].map((group, i) => (
                <Col key={group}>
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
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="out">
          <Accordion.Header>Check Out</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col xs={6}>
                <InputGroup className="mb-3">
                  <FloatingLabel label="Actual Mileage">
                    <Form.Control
                      id="mileage-actual"
                      type="number"
                      step={0.1}
                      placeholder="Actual Mileage"
                      value={state.mileage?.toFixed(1) || 3}
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
            <Row className="checkIn-row">
              {["pace", "duration"].map((group, i) => (
                <Col key={group}>
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
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <Button variant="danger" name={activeKey} type="submit" className="m-3">
        {activeKey === "in" ? "Check In" : "Check Out"}
      </Button>
    </Form>
  );
};

export default Inputs;
