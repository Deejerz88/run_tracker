import "./App.css";
import { ParticipantTable } from "./components/index.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Image, Row, Button } from "react-bootstrap";
import { createContext } from "react";

const user = JSON.parse(sessionStorage.getItem("user")) || {};
const loggedIn =
  JSON.parse(sessionStorage.getItem("loggedIn"))?.toString() || "false";

export const UserContext = createContext();

function App() {
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
      <UserContext.Provider
        value={{
          user,
          loggedIn,
        }}
      >
        <ParticipantTable />
      </UserContext.Provider>
    </>
  );
}

export default App;
