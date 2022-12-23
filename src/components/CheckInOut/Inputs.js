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

const Inputs = ({ checkIn, handleChange, handleSubmit }) => {
  const [activeKey, setActiveKey] = useState("in");
  return (
    <Form onSubmit={handleSubmit}>
      <Accordion
        id="checkInOut"
        defaultActiveKey="in"
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
                      placeholder="Target Mileage"
                      value={checkIn.mileage || 3}
                      onChange={handleChange}
                      name="in"
                    />
                  </FloatingLabel>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              {["pace", "duration"].map((group, i) => (
                <Col key={group}>
                  <FormLabel>{group}</FormLabel>
                  <InputGroup className="mb-3">
                    {["hours", "minutes", "seconds"].map((type, i) => {
                      if (group === "pace" && type === "hours") return null;
                      return (
                        <FloatingLabel key={type} label={type}>
                          <Form.Control
                            id={`${group}-${type}`}
                            type="number"
                            step={type === "seconds" ? 5 : 1}
                            value={checkIn[group][type]}
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
                <FormLabel>Estimated Return</FormLabel>
                <Form.Control
                  id="finish-target"
                  type="time"
                  value={
                    checkIn.finish ||
                    DateTime.now()
                      .plus({
                        minutes: checkIn.duration.minutes,
                        seconds: checkIn.duration.seconds,
                      })
                      .toFormat("HH:mm")
                  }
                  onChange={handleChange}
                  name="in"
                />
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
                      placeholder="Actual Mileage"
                      value={checkIn.mileage || 3}
                      onChange={handleChange}
                      name="out"
                    />
                  </FloatingLabel>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              {["pace", "duration"].map((group, i) => (
                <Col key={group}>
                  <FormLabel>{group}</FormLabel>
                  <InputGroup className="mb-3">
                    {["hours", "minutes", "seconds"].map((type, i) => {
                      if (group === "pace" && type === "hours") return null;
                      return (
                        <FloatingLabel key={type} label={type}>
                          <Form.Control
                            id={`${group}-${type}`}
                            type="number"
                            step={type === "seconds" ? 5 : 1}
                            value={checkIn[group][type]}
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
            <Row>
              <Col xs={6}>
                <FormLabel>Actual Return</FormLabel>
                <Form.Control
                  id="finish-actual"
                  type="time"
                  value={
                    checkIn.finish ||
                    DateTime.now()
                      .plus({
                        minutes: checkIn.duration.minutes,
                        seconds: checkIn.duration.seconds,
                      })
                      .toFormat("HH:mm")
                  }
                  onChange={handleChange}
                  name="out"
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <Button variant="primary" type="submit" className="m-3">
        {activeKey === "in" ? "Check In" : "Check Out"}
      </Button>
    </Form>
  );
};

export default Inputs;
