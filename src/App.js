import "./App.css";
import { ParticipantTable } from "./components/index.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Image, Row, Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";

const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
  cluster: "us2",
});

const channel = pusher.subscribe("checkin");

function App() {
  const [loggedIn, setLoggedIn] = useState("false");

  return (
    <>
      <ToastContainer />
      <Button id="install-app" variant="outline-danger">
        Install App
      </Button>
      <Button id="login" variant="danger" name={loggedIn}>
        {loggedIn === "true" ? "Log Out" : "Log In"}
      </Button>
      <Row>
        <Image
          id="logo"
          fluid
          src="./assets/images/logo.png"
          className="mx-auto"
        />
      </Row>

      <ParticipantTable loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
    </>
  );
}

export default App;
