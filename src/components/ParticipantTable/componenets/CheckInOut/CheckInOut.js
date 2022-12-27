import React, { useEffect, useState } from "react";
import { Modal, Tabs, Tab, Row, Col, Card } from "react-bootstrap";
import Inputs from "./Inputs.js";
import { handleChange, handleSubmit } from "./utils/index.js";
import "./style.css";

const CheckInOut = ({
  show,
  setShow,
  participant,
  setParticipant,
  race,
  table,
  date,
}) => {
  const [state, setState] = useState({
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

  const handleClose = () => {
    setShow(false);
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
    setParticipant({});
  };

  useEffect(() => {
    if (!participant.user_id || !race.id || !table) return;
    console.log("participant", participant);
    if (!participant?.races || !race) return;
    const thisRace = participant.races.find((r) => r?.id === race.id);
    console.log("thisRace", thisRace);
    if (!thisRace) return;
    const todaysAttendance = thisRace.attendance.find((a) => a.date === date);
    console.log("todaysAttendance", todaysAttendance);
    if (!todaysAttendance) {
      setState({
        mileage: thisRace.avgMileage,
        pace: thisRace.avgPace,
        duration: thisRace.avgDuration,
        start: null,
        finish: null,
      });
      return;
    }

    const { mileage, pace, duration, start, finish, checkedIn, checkedOut } =
      todaysAttendance;

    setState({
      mileage,
      pace,
      duration,
      checkedIn,
      checkedOut,
      start: start,
      finish: finish,
    });
  }, [participant, race, table, date]);

  useEffect(() => {
    console.log("state", state);
  }, [state]);

  return (
    <Modal size="xl" fullscreen={true} show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{`${participant.first_name} ${participant.last_name} - ${race.name}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs justify defaultActiveKey="checkIn">
          <Tab eventKey="checkIn" title="Check In / Out">
            <Inputs
              state={state}
              checkedIn={participant.checkedIn}
              handleChange={(e) => handleChange({ e, state, setState })}
              handleSubmit={(e) =>
                handleSubmit({
                  e,
                  state,
                  setState,
                  participant,
                  race,
                  table,
                  handleClose,
                  date,
                })
              }
              table={table}
            />
          </Tab>
          <Tab eventKey="stats" title="Stats">
            <Row className="stats-row m-3">
              <h1>Stats</h1>
              {["race", "Overall"].map((title) => {
                title = title === "race" ? race.name : title;
                const stats =
                  title === "Overall" && participant.totalDuration
                    ? participant
                    : participant.races?.find((r) => r.name === title) || {
                        totalAttendance: 0,
                        totalMileage: 0,
                        avgMileage: 0,
                        totalDuration: {
                          hours: 0,
                          minutes: 0,
                          seconds: 0,
                        },
                        avgDuration: {
                          hours: 0,
                          minutes: 0,
                          seconds: 0,
                        },
                        avgPace: {
                          minutes: 0,
                          seconds: 0,
                        },
                      };
                return (
                  <Row className="mb-3">
                    <Col>
                      <Card>
                        <Card.Header className="fs-4">{title}</Card.Header>
                        <Card.Body>
                          <Row>
                            <Col>
                              <Card.Title className="">
                                <u>Attendance</u>
                              </Card.Title>
                              <h6 className="d-inline">Total: </h6>
                              {stats.totalAttendance}
                            </Col>
                            <Col>
                              <Card.Title>
                                <u>Mileage</u>
                              </Card.Title>
                              <h6 className="d-inline">Total: </h6>{" "}
                              {stats.totalMileage}
                              <br />
                              <h6 className="d-inline">Average: </h6>
                              {stats.avgMileage?.toFixed(2)}
                            </Col>
                            <Col>
                              <Card.Title>
                                <u>Duration</u>
                              </Card.Title>
                              <h6>Total:</h6>
                              <p>
                                {`${stats.totalDuration?.hours} hours
                                 ${stats.totalDuration?.minutes} minutes 
                                 ${Math.round(
                                   stats.totalDuration?.seconds
                                 )} seconds`}
                              </p>
                              <h6>Average:</h6>
                              <p>
                                {`${stats.avgDuration?.hours} hours 
                                ${stats.avgDuration?.minutes} minutes 
                                ${Math.round(
                                  stats.avgDuration?.seconds
                                )} seconds`}
                              </p>
                            </Col>
                            <Col>
                              <Card.Title>
                                <u>Pace</u>
                              </Card.Title>
                              <h6>Average:</h6>
                              <p>
                                {`${stats.avgPace?.minutes} minutes
                                  ${Math.round(
                                    stats.avgPace?.seconds
                                  )} seconds`}
                              </p>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                );
              })}
            </Row>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default CheckInOut;
