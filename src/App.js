import "./App.css";
import { ParticipantTable } from "./components/index.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Image, Row, Button } from "react-bootstrap";
import { useEffect, useState, createContext } from "react";

export const UserContext = createContext({}, () => {});

function App() {
  const [state, setState] = useState({
    user: {},
    loggedIn: "false",
    stayLoggedIn: "false",
    checkedIn: "false",
  });

  useEffect(() => {
    const stayLoggedIn =
      localStorage.getItem("stayLoggedIn")?.toString() ||
      sessionStorage.getItem("stayLoggedIn")?.toString() ||
      "false";

    const user = stayLoggedIn
      ? localStorage.getItem("user")
      : sessionStorage.getItem("user");

    const loggedIn = stayLoggedIn
      ? localStorage.getItem("loggedIn")
      : sessionStorage.getItem("loggedIn");

    const checkedIn = stayLoggedIn
      ? localStorage.getItem("checkedIn")
      : sessionStorage.getItem("checkedIn");
    
    const newState = {
      user: (user && JSON.parse(user)) || {},
      loggedIn: (loggedIn && JSON.parse(loggedIn)?.toString()) || "false",
      stayLoggedIn:
        (stayLoggedIn && JSON.parse(stayLoggedIn)?.toString()) || "false",
      checkedIn: (checkedIn && JSON.parse(checkedIn)?.toString()) || "false",
    };

    setState(newState);
  }, []);

  useEffect(() => {
    console.log("state", state);
    if (state.stayLoggedIn === "true") {
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("loggedIn", state.loggedIn);
      localStorage.setItem("stayLoggedIn", state.stayLoggedIn);
      localStorage.setItem("checkedIn", state.checkedIn);
    } else {
      sessionStorage.setItem("user", JSON.stringify(state.user));
      sessionStorage.setItem("loggedIn", state.loggedIn);
      sessionStorage.setItem("stayLoggedIn", state.stayLoggedIn);
      sessionStorage.setItem("checkedIn", state.checkedIn);
    }
  }, [state]);

  return (
    <>
      <ToastContainer />
      <Row>
        <Image
          id="logo"
          fluid
          src="./assets/images/logo.png"
          className="mx-auto"
        />
      </Row>
      <Button id="install-app" variant="outline-danger">
        Install App
      </Button>
      <UserContext.Provider value={[state, setState]}>
        <ParticipantTable />
      </UserContext.Provider>
    </>
  );
}

export default App;
