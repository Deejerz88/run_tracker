import React, { useEffect, useState } from "react";
import { Modal, Tabs, Tab } from "react-bootstrap";
import { Inputs, Stats, History, Contact } from "./components/index.js";
import { BsXSquareFill } from "react-icons/bs/index.esm.js";
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
    setTimeout(() => setParticipant({}), 100);
  };

  const handleClick = (e) => {
    const card = e.target.closest(".card");
    console.log("card", card);
    const { id } = card;
    if (id === "phone-card") {
      const phone = participant.phone;
      if (phone) {
        window.open(`tel:${phone}`, "_blank");
      }
    } else if (id === "email-card") {
      const email = participant.email;
      if (email) {
        window.open(`mailto:${email}`, "_blank");
      }
    }
  };

  useEffect(() => {
    if (!participant.user_id || !race.id || !table) return;
    console.log("participant", participant, "race", race);
    if (!participant?.races || !race) return;
    const thisRace = participant.races.find((r) => r?.id === race.id);
    console.log("thisRace", thisRace);
    if (!thisRace) {
      if (!participant.avgMileage) return;
      setState({
        mileage: participant.avgMileage,
        pace: participant.avgPace,
        duration: participant.avgDuration,
        start: null,
        finish: null,
      });
      return;
    }
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
    <Modal fullscreen={true} show={show} onHide={handleClose}>
      <Modal.Header className="d-flex justify-content-between">
        <Modal.Title>{`${participant.first_name} ${participant.last_name} - ${race.name}`}</Modal.Title>
        <BsXSquareFill id="close-modal" onClick={handleClose} />
      </Modal.Header>
      <Modal.Body>
        <Tabs justify defaultActiveKey="checkIn">
          <Tab eventKey="checkIn" title="Check In / Out">
            <Inputs
              state={state}
              setState={setState}
              checkedIn={participant.checkedIn}
              participant={participant}
              race={race}
              table={table}
              handleClose={handleClose}
              date={date}
            />
          </Tab>
          <Tab eventKey="stats" title="Stats" className="stats-tab">
            <Stats participant={participant} race={race} />
          </Tab>
          <Tab eventKey="history" title="History">
            <History participant={participant} />
          </Tab>
          <Tab eventKey="contact" title="Contact Info" className="contact-tab">
            <Contact participant={participant} handleClick={handleClick} />
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default CheckInOut;
