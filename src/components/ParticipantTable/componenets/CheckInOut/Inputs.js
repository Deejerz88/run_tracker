import React, { useState } from "react";
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

const Inputs = ({ state, checkedIn, handleChange, handleSubmit }) => {
  const [activeKey, setActiveKey] = useState("in");

  const handleClick = (e) => {
    if (e.target.type === "number") {
      e.target.select();
    }
  };
  return (
    <Form onSubmit={handleSubmit} onClick={handleClick}>
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
                      onChange={handleChange}
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
                      onChange={handleChange}
                      name="in"
                    />
                  </FloatingLabel>
                </InputGroup>
              </Col>
            </Row>
            <Row className="mb-3">
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
                              onChange={handleChange}
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
                    onChange={handleChange}
                    name="in"
                  />
                </FloatingLabel>
              </Col>
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
                      onChange={handleChange}
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
                    onChange={handleChange}
                    name="out"
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row>
              {["pace", "duration"].map((group, i) => (
                <Col key={group}>
                  <FormLabel>{startCase(group)}</FormLabel>
                  <InputGroup className="mb-3">
                    {["hours", "minutes", "seconds"].map((type, i) => {
                      if (group === "pace" && type === "hours") return null;
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
                            onChange={handleChange}
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