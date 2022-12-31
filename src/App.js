import "./App.css";
import { ParticipantTable } from "./components/index.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Image, Row,  Button } from "react-bootstrap";
function App() {
 
  return (
    <>
      <ToastContainer />
      <Button id="install-app" variant="outline-danger">
        Install App
      </Button>
      <Row>
        <Image
          id="logo"
          fluid
          src="./assets/images/logo.png"
          className="mx-auto my-3"
        />
      </Row>

      <ParticipantTable />
    </>
  );
}

export default App;
