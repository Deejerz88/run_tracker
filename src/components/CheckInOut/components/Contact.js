import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  FloatingLabel,
  InputGroup,
} from "react-bootstrap";
import { startCase } from "lodash";
import { toast } from "react-toastify";
import $ from "jquery";

const Contact = ({ participant, handleClick }) => {
  const [pin, setPin] = useState("");
  const pw = "2299";

  useEffect(() => {
    if (pin === pw) $("#contact-row").show(250);
    else if (pin.length < pw.length) {
      $("#contact-row").hide(250);
    } else if (pin.length === pw.length) {
      toast.error("Incorrect pin", { position: "top-center" });
      setPin("");
    }
  }, [pin]);
  return (
    <>
      <Row id="pin-row" className="justify-content-center w-100">
        <Col xs={12} md={6} className="d-flex justify-content-center">
          <InputGroup id="pin-group" className="mt-3">
            <FloatingLabel label="Pin">
              <Form.Control
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </FloatingLabel>
          </InputGroup>
        </Col>
      </Row>
      <Row id="contact-row" className="justify-content-center w-100">
        {["phone", "email"].map((key) => {
          return (
            <Card
              key={key}
              id={`${key}-card`}
              className="contact-card"
              onClick={handleClick}
            >
              <Card.Body className={`${key}-body`}>
                <Card.Header>{startCase(key)}</Card.Header>
                <Card.Text id={`${key}-body`}>{participant[key]}</Card.Text>
              </Card.Body>
            </Card>
          );
        })}
      </Row>
    </>
  );
};

export default Contact;
