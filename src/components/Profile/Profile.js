import React, { useEffect, useState, useContext } from "react";
import { Tabs, Tab, Row, Col, Spinner } from "react-bootstrap";
import {
  Inputs,
  Stats,
  History,
  Contact,
  Account,
  Goals,
} from "./components/index.js";
import "./style.css";
import { AppContext } from "../../App.js";
import axios from "axios";
import { FaHome } from "react-icons/fa/index.esm.js";
import { useNavigate } from "react-router-dom";
import {
  BsCheck2All,
  BsCalendar2Week,
  BsTrophy,
} from "react-icons/bs/index.esm.js";
import { TbDeviceWatchStats } from "react-icons/tb/index.esm.js";
import { MdManageAccounts } from "react-icons/md/index.esm.js";
import $ from "jquery";

const Profile = ({ table }) => {
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
  const [Context, setContext] = useContext(AppContext);
  let { user, participant, race, date } = Context;
  console.log("Profile Context", Context);
  const navigate = useNavigate();
  if (!participant.user_id) {
    const user_id = Number(window.location.pathname.split("/")[2]);
    console.log("user_id", user_id);
    (async () => {
      const { data } = await axios.get(`/participant/${user_id}`);
      console.log("data", data);
      if (!data) return;
      setContext((prev) => ({ ...Context, participant: data }));
    })();
  }

  const handleClose = () => {
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
    let race = $("#checkin-race").val();
    console.log("race", {
      id: 27849,
      name: "2023 Blue Cross Winter Warm Up",
      type: "race",
      eventIds: [675203],
    });
    setTimeout(
      () => setContext((prev) => ({ ...prev, participant: {}, race })),
      100
    );
  };

  const handleClick = (e) => {
    let { id } = e.target;
    console.log("target", e.target);
    const card = e.target.closest(".card");
    console.log("card", card);
    id = card.id;
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
      start,
      finish,
    });
  }, [participant, race, table, date]);

  useEffect(() => {
    console.log("state", state);
  }, [state]);

  return (
    <>
      {!participant.user_id ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Row id="profile-header">
            <Col xs={10}>
              <h2>{`${participant.first_name} ${participant.last_name}`}</h2>
            </Col>
            <Col
              xs={2}
              className="d-flex align-items-center justify-content-center"
              onClick={() => {
                console.log("redirecting to home");
                handleClose();
                navigate("/");
              }}
              id="home-col"
            >
              <FaHome id="home-button" />
            </Col>
          </Row>
          <Tabs
            justify
            defaultActiveKey={
              user?.user_id === participant.user_id ? "checkIn" : "stats"
            }
          >
            {user?.user_id === participant.user_id && (
              <Tab
                eventKey="checkIn"
                title={
                  <Row className="flex-column justify-content-end">
                    <BsCheck2All size="1.5em" />
                    Check In
                  </Row>
                }
              >
                <Inputs
                  state={state}
                  setState={setState}
                  table={table}
                  handleClose={handleClose}
                />
              </Tab>
            )}
            <Tab
              eventKey="stats"
              title={
                <Row className="flex-column justify-content-end">
                  <TbDeviceWatchStats size="1.5em" /> Stats
                </Row>
              }
              className="stats-tab"
            >
              <Stats />
            </Tab>
            <Tab
              eventKey="history"
              title={
                <Row className="flex-column justify-content-center">
                  <BsCalendar2Week size="1.2em" /> History
                </Row>
              }
            >
              <History />
            </Tab>
            {user?.user_id === participant.user_id && (
              <Tab
                eventKey="goals"
                title={
                  <Row className="flex-column justify-content-center">
                    <BsTrophy size="1.2em" /> Goals
                  </Row>
                }
              >
                <Goals />
              </Tab>
            )}
            {user?.user_id === participant.user_id ? (
              <Tab
                eventKey="account"
                title={
                  <Row className="flex-column">
                    <MdManageAccounts size="1.5em" /> Account
                  </Row>
                }
              >
                <Account />
              </Tab>
            ) : (
              <Tab
                eventKey="contact"
                title="Contact Info"
                className="contact-tab"
              >
                <Contact handleClick={handleClick} />
              </Tab>
            )}
          </Tabs>
        </>
      )}
    </>
  );
};

export default Profile;
