import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  InputGroup,
  FloatingLabel,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { BsXSquareFill } from "react-icons/bs/index.esm.js";
import { toast, Flip } from "react-toastify";
import "./style.css";
import $ from "jquery";

const Login = ({ show, setShow, setParticipant, participant }) => {
  const [state, setState] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleClick = (e) => {
    const { id } = e.target;
    if (id === "signup-switch") {
      const { checked } = e.target;
      checked ? $("#email-group").show(200) : $("#email-group").hide(200);
    }
  };

  const handleClose = () => {
    setShow(false);
    setState({
      email: "",
      username: "",
      password: "",
    });
    setTimeout(() => setParticipant({}), 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("state", state);
    const { username, password, email } = state;
    const signup = $("#signup-switch").prop("checked");
    console.log("signup", signup);
    let res;
    try {
      res = signup
        ? await axios.post("/user/signup", {
            email,
            username,
            password,
          })
        : await axios.post("/user/login", {
            username,
            password,
          });
    } catch (err) {
      console.log("err", err);
      const message =
        err.response.status === 409
          ? "User with email already exists"
          : "Invalid username or password";
      toast.error(message, {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
      return;
    }
    console.log("res", res);
    const { user } = res.data;
    setParticipant(user);
    const message = user.first_name
      ? `${user.first_name} ${user.last_name} logged in`
      : `${user.username} logged in`;
    toast.success(message, {
      position: "top-center",
      autoClose: 3000,
      transition: Flip,
    });
    handleClose();
  }; 

  return (
    <Modal size="lg" show={show} onHide={handleClose} centered>
      <Modal.Header className="d-flex justify-content-between">
        <Modal.Title>Log In</Modal.Title>
        <BsXSquareFill className="close-modal" onClick={handleClose} />
      </Modal.Header>
      <Modal.Body>
        <Form id="login-form" onSubmit={handleSubmit}>
          <Row className="">
            <Col className="d-flex justify-content-end">
              <Form.Check
                type="switch"
                id="signup-switch"
                label="Sign Up"
                className="m-3"
                onClick={handleClick}
              />
            </Col>
          </Row>
          <Row id="email-group" className="px-3">
            <InputGroup className="mb-3">
              <FloatingLabel label="Email">
                <Form.Control
                  id="email-login"
                  type="email"
                  name="email"
                  value={state.email}
                  onChange={handleChange}
                />
              </FloatingLabel>
            </InputGroup>
          </Row>
          <Row className="px-3">
            <InputGroup className="my-3">
              <FloatingLabel label="Username">
                <Form.Control
                  id="username-login"
                  type="text"
                  name="username"
                  value={state.username}
                  onChange={handleChange}
                />
              </FloatingLabel>
            </InputGroup>
          </Row>
          <Row className="px-3">
            <InputGroup className="my-3">
              <FloatingLabel label="Password">
                <Form.Control
                  id="password-login"
                  type="password"
                  name="password"
                  value={state.password}
                  onChange={handleChange}
                />
              </FloatingLabel>
            </InputGroup>
          </Row>
          <Row className="">
            <Col>
              <Button className="m-3" variant="danger" type="submit">
                Submit
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Login;
