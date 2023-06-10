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
import { DateTime } from "luxon";

const Profile = () => {
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
    start: 0,
    finish: 0,
    doNotWait: false,
  });
  const [races, setRaces] = useState([]);

  // get participant from context
  const [Context, setContext] = useContext(AppContext);
  let { user, participant } = Context;

  const navigate = useNavigate();

  if (!participant.user_id) {
    //get participant if not in context
    const user_id = Number(window.location.pathname.split("/")[2]);
    (async () => {
      const { data } = await axios.get(`/participant/${user_id}`);
      if (!data) return;
      setContext((prev) => ({ ...prev, participant: data }));
    })();
  }

  const handleClick = (e) => {
    //get closest contact cards
    const card = e.target.id.closest(".card");
    const { id } = card;

    if (id === "phone-card") {
      const phone = participant.phone;
      //open phone app / tab
      if (phone) {
        window.open(`tel:${phone}`, "_blank");
      }
    } else if (id === "email-card") {
      const email = participant.email;
      if (email) {
        //open email app / tab
        window.open(`mailto:${email}`, "_blank");
      }
    }
  };

  useEffect(() => {
    const { race, date } = Context;

    if (!race.id) {
      //set default race
      setContext((prev) => ({
        ...prev,
        race: { id: 2190, name: "Team Playmakers", type: "club" },
      }));
    }

    if (!participant.user_id || !race.id) return;

    if (race.name === "Team Playmakers") {
      //set default start times
      const { weekdayLong } = DateTime.local();
      const startTime = weekdayLong === "Saturday" ? 8 : 18; // 8am on Saturday, 6pm otherwise
      setState((prev) => ({
        ...prev,
        start: DateTime.local().set({ hour: startTime, minute: 0 }).toMillis(),
      }));
    }

    const thisRace = participant.races?.find((r) => r?.id === race.id);
    if (!thisRace) return;

    const todaysAttendance = thisRace.attendance?.find((a) => a.date === date);
    if (!todaysAttendance) return;

    const {
      mileage,
      pace,
      duration,
      start,
      finish,
      checkedIn,
      checkedOut,
      doNotWait,
    } = todaysAttendance;

    setState((prev) => ({
      mileage: mileage ?? prev.mileage,
      pace: pace ?? prev.pace,
      duration: duration ?? prev.duration,
      checkedIn: checkedIn ?? prev.checkedIn,
      checkedOut: checkedOut ?? prev.checkedOut,
      start: start ?? prev.start,
      finish: finish ?? prev.finish,
      doNotWait: doNotWait ?? prev.doNotWait,
    }));
  }, [participant, Context, setContext]);

  useEffect(() => {
    (async () => {
      let { data: races } = await axios.get("/race");
      setRaces(["", ...races]);
    })();
  }, []);

  return (
    <>
      {!participant.user_id ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Row id="profile-header">
            <Col xs={10}>
              <h2>
                {participant.first_name
                  ? `${participant.first_name} ${participant.last_name}`
                  : participant.username}
              </h2>
            </Col>
            <Col
              xs={2}
              className="d-flex align-items-center justify-content-center"
              onClick={() => {
                console.log("redirecting to home");
                navigate("/");
              }}
              id="home-col"
            >
              <FaHome id="home-button" />
            </Col>
          </Row>
          <Tabs
            justify
            activeKey={
              // user?.user_id === participant.user_id ? "checkIn" : "stats"
              window.location.href.split("/")[5] || "checkin"
            }
            onSelect={(key) => {
              console.log("key", key);
              navigate(`/profile/${participant.user_id}/${key}`);
            }}
          >
            <Tab
              eventKey="checkin"
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
                Context={Context}
                setContext={setContext}
                races={races}
              />
            </Tab>

            <Tab
              eventKey="stats"
              title={
                <Row className="flex-column justify-content-end">
                  <TbDeviceWatchStats size="1.5em" /> Stats
                </Row>
              }
              className="stats-tab"
            >
              <Stats Context={Context} />
            </Tab>
            <Tab
              eventKey="history"
              title={
                <Row className="flex-column justify-content-center">
                  <BsCalendar2Week size="1.2em" /> History
                </Row>
              }
            >
              <History
                setState={setState}
                Context={Context}
                setContext={setContext}
                races={races}
              />
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
                <Account Context={Context} setContext={setContext} />
              </Tab>
            ) : (
              <Tab
                eventKey="contact"
                title="Contact Info"
                className="contact-tab"
              >
                <Contact handleClick={handleClick} Context={Context} />
              </Tab>
            )}
          </Tabs>
        </>
      )}
    </>
  );
};

export default Profile;
