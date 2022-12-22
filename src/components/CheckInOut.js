import { DateTime, Duration } from "luxon";
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Modal,
  Form,
  Button,
  Accordion,
  InputGroup,
  FloatingLabel,
  FormLabel,
} from "react-bootstrap";
import $ from "jquery";

const CheckInOut = ({ show, setShow, member }) => {
  const [checkIn, setCheckIn] = useState({
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
    finish: null,
  });
  const [checkOut, setCheckOut] = useState({
    mileage: 0,
    pace: {},
    duration: {},
    finish: null,
  });

  const handleClose = () => setShow(false);

  useEffect(() => {
    console.log("member", member);
    // if (member) {
    //   setCheckIn(member.checkIn);
    //   setCheckOut(member.checkOut);
    // }
  }, [member]);

  const handleChange = (e) => {
    let { id, value } = e.target;
    let group = id.split("-")[0];
    let type = id.split("-")[1];
    console.log("id", id, "group", group, "type", type);
    console.log("value", value);
    let newDuration;
    switch (group) {
      case "mileage":
        const update = { mileage: value };
        const { minutes, seconds } = checkIn.pace;
        newDuration = Duration.fromObject({
          hours: 0,
          minutes: minutes * value,
          seconds: seconds * value,
        });
        update.duration = newDuration.values;
        console.log("newDuration", newDuration.values);
        update.finish = DateTime.local().plus(newDuration).toFormat("HH:mm");
        setCheckIn({ ...checkIn, ...update });
        break;
      case "pace":
        if (type === "minutes") {
          let { hours, seconds } = checkIn.duration;
          let minutes = value * checkIn.mileage;
          if (minutes > 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
          } else if (minutes === 60) {
            hours += 1;
            minutes = 0;
          }
          newDuration = { hours, minutes, seconds };
          setCheckIn({
            ...checkIn,
            [group]: {
              ...checkIn[group],
              [type]: Number(value),
            },
            duration: newDuration,
            finish: DateTime.local().plus(newDuration).toFormat("HH:mm"),
          });
        } else if (type === "seconds") {
          let { hours, minutes } = checkIn.duration;
          let seconds = value * checkIn.mileage;
          if (seconds > 60) {
            minutes += Math.floor(seconds / 60);
            seconds = seconds % 60;
          } else if (seconds === 60) {
            minutes += 1;
            seconds = 0;
          }
          if (minutes > 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
          } else if (minutes === 60) {
            hours += 1;
            minutes = 0;
          }
          newDuration = { hours, minutes, seconds };
          setCheckIn({
            ...checkIn,
            [group]: {
              ...checkIn[group],
              [type]: Number(value),
            },
            duration: newDuration,
            finish: DateTime.local().plus(newDuration).toFormat("HH:mm"),
          });
        }
        break;
      case "duration":
        if (type === "hours") {
          let { minutes: durMin, seconds: durSec } = checkIn.duration;
          let minutes = (value * 60) / checkIn.mileage;
          let seconds = (minutes % 1) * 60;
          minutes = Math.floor(minutes);
          seconds = seconds.toFixed(1);
          setCheckIn({
            ...checkIn,
            [group]: {
              ...checkIn[group],
              [type]: Number(value),
            },
            pace: {
              minutes,
              seconds,
            },
            finish: DateTime.local()
              .plus({ hours: value, minues: durMin, seconds: durSec })
              .toFormat("HH:mm"),
          });
        } else if (type === "minutes") {
          let { hours: durHours, seconds: durSec } = checkIn.duration;
          let minutes = value / checkIn.mileage;
          let seconds = (minutes % 1) * 60;
          minutes = Math.floor(minutes);
          seconds = seconds.toFixed(1);
          setCheckIn({
            ...checkIn,
            [group]: {
              ...checkIn[group],
              [type]: Number(value),
            },
            pace: {
              minutes,
              seconds,
            },
            finish: DateTime.local()
              .plus({ hours: durHours, minutes: value, seconds: durSec })
              .toFormat("HH:mm"),
          });
        } else if (type === "seconds") {
          let { hours: durHours, minutes: durMin } = checkIn.duration;
          let minutes = value / 60 / checkIn.mileage;
          let seconds = (minutes % 1) * 60;
          minutes = Math.floor(minutes);
          seconds = seconds.toFixed(1);
          setCheckIn({
            ...checkIn,
            [group]: {
              ...checkIn[group],
              [type]: Number(value),
            },
            pace: {
              minutes,
              seconds,
            },
            finish: DateTime.local()
              .plus({
                hours: durHours,
                minutes: durMin,
                seconds: value,
              })
              .toFormat("HH:mm"),
          });
        }
        break;
      case "finish":
        let finish = DateTime.fromFormat(value, "HH:mm");
        const now = DateTime.local();
        console.log("finish", finish, "now", now);
        newDuration = finish.diff(now, ["hours", "minutes", "seconds"]);
        console.log("newDuration", newDuration);
        let {
          hours: durationHours,
          minutes: durationMinutes,
          seconds: durationSeconds,
        } = newDuration.toObject();
        let paceMinutes = newDuration.as("minutes") / checkIn.mileage;
        let paceSeconds = (paceMinutes % 1) * 60;
        paceMinutes = Math.floor(paceMinutes);
        paceSeconds = paceSeconds.toFixed(1);
        durationHours = Math.floor(durationHours);
        durationMinutes = Math.floor(durationMinutes);
        durationSeconds = durationSeconds?.toFixed(1) || 0;
        setCheckIn({
          ...checkIn,
          [group]: value,
          duration: {
            hours: durationHours,
            minutes: durationMinutes,
            seconds: durationSeconds,
          },
          pace: {
            minutes: paceMinutes,
            seconds: paceSeconds,
          },
        });

        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log("checkIn", checkIn);
  }, [checkIn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("submit");
  };

  return (
    <Modal size="xl" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{`${member.firstName} ${member.lastName}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Check In</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col xs={6}>
                    <InputGroup className="mb-3">
                      <FloatingLabel label="Target Mileage">
                        <Form.Control
                          id="mileage"
                          type="number"
                          placeholder="Target Mileage"
                          value={checkIn.mileage || 3}
                          onChange={handleChange}
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
                              />
                            </FloatingLabel>
                          );
                        })}
                      </InputGroup>
                    </Col>
                  ))}
                </Row>

                {/* <FormLabel>Target Pace</FormLabel>
                    <InputGroup className="mb-3">
                      <FloatingLabel label="Minutes">
                        <Form.Control
                          id="pace-minutes"
                          type="number"
                          step={1}
                          value={checkIn.pace.minutes}
                          onChange={handleChange}
                        />
                      </FloatingLabel>
                      <FloatingLabel label="Seconds">
                        <Form.Control
                          id="pace-seconds"
                          type="number"
                          step={5}
                          value={checkIn.pace.seconds}
                          onChange={handleChange}
                        />
                      </FloatingLabel>
                    </InputGroup>
                  </Col>
                  <Col>
                    <FormLabel>Target Duration</FormLabel>
                    <InputGroup className="mb-3">
                      <FloatingLabel label="Hours">
                        <Form.Control
                          id="duration-hours"
                          type="number"
                          step={1}
                          value={checkIn.duration.hours}
                          onChange={handleChange}
                        />
                      </FloatingLabel>
                      <FloatingLabel label="Minutes">
                        <Form.Control
                          id="duration-minutes"
                          type="number"
                          step={1}
                          value={checkIn.duration.minutes}
                          onChange={handleChange}
                        />
                      </FloatingLabel>
                      <FloatingLabel label="Seconds">
                        <Form.Control
                          id="duration-seconds"
                          type="number"
                          step={5}
                          value={checkIn.duration.seconds}
                          onChange={handleChange}
                        />
                      </FloatingLabel>
                    </InputGroup>
                  </Col>
                </Row> */}
                <Row>
                  <Col xs={6}>
                    <FormLabel>Estimated Return</FormLabel>
                    <Form.Control
                      id="finish"
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
                    />
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CheckInOut;
