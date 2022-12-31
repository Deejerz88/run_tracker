import "./App.css";
import { ParticipantTable } from "./components/index.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Image, Row, Col, Button } from "react-bootstrap";
import $ from "jquery";
function App() {
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    deferredPrompt = e;
    $("#install-app").show();
  });

  const installApp = document.getElementById("install-app");
  installApp?.addEventListener("click", async () => {
    if (deferredPrompt !== null) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        deferredPrompt = null;
      }
    }
  });
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
