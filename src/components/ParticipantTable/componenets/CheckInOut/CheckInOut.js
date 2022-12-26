import React, { useEffect, useState } from "react";
import { Modal, Tabs, Tab } from "react-bootstrap";
import Inputs from "./Inputs.js";
import { handleChange, handleSubmit } from "./utils/index.js";
import { DateTime } from "luxon";

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
    const thisRace = participant.races.find((r) => r.id === race.id);
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
  }, [participant, race, table]);

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
          <Tab eventKey="checkIn" title="Check In">
            <Inputs
              state={state}
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
            <h1>Stats</h1>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default CheckInOut;
