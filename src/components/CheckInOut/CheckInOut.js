import { DateTime, Duration } from "luxon";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Inputs from "./Inputs.js";
import { handleChange, handleSubmit } from "./utils/index.js";

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

  useEffect(() => {
    console.log("checkIn", checkIn);
  }, [checkIn]);

  return (
    <Modal size="xl" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{`${member.firstName} ${member.lastName}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Inputs
          checkIn={checkIn}
          handleChange={(e) => handleChange({ e, checkIn, setCheckIn })}
          handleSubmit={(e) => handleSubmit({ e, checkIn, setCheckIn })}
        />
      </Modal.Body>
    </Modal>
  );
};

export default CheckInOut;
