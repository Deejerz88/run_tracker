import { Row, Image, Button } from "react-bootstrap";
import { useEffect, useState, createContext } from "react";
import { ParticipantTable } from "../components/index.js";

const Home = () => {
  return (
    <>
      <Row>
        <Image
          id="logo"
          fluid
          src="./assets/images/logo.webp"
          className="mx-auto"
        />
      </Row>
      <Button id="install-app" variant="outline-danger">
        Install App
      </Button>
      <ParticipantTable />
    </>
  );
};

export default Home;
