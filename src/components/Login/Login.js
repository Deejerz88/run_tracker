import React, { useContext, useState } from "react";
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
import { TiArrowBackOutline } from "react-icons/ti/index.esm.js";
import { toast, Flip } from "react-toastify";
import { AppContext } from "../../App.js";
import "./style.css";
import $ from "jquery";

const Login = ({ show, setShow }) => {
  const [state, setState] = useState({
    email: "",
    username: "",
    password: "",
    action: "Log In",
  });

  const [Context, setContext] = useContext(AppContext);

  const handleClick = (e) => {
    const { id, nodeName } = e.target;
    console.log("id", id, nodeName);
    switch (id) {
      case "signup-switch":
        const { checked } = e.target;
        if (checked) {
          $("#email-row").show(200);
          $("#reset").hide(100);
          $("#email-login").focus();
          setState((prevState) => ({
            ...prevState,
            action: "Sign Up",
          }));
        } else {
          $("#email-row").hide(200);
          $("#reset").show(100);
          $("#username-login").focus();
          setState((prevState) => ({
            ...prevState,
            action: "Log In",
          }));
        }
        break;
      case "reset":
        $("#reset-back .back-arrow").show(50);
        $("#email-row").show(200);
        $("#reset").hide(100);
        $("#username-row").hide(200);
        $("#password-row").hide(200);
        $("#login-form .form-switch").hide(200);
        $("#email-login").focus();
        setState((prevState) => ({
          ...prevState,
          action: "Recover Account",
        }));
        break;
      default:
        $("#reset-back .back-arrow").hide(100);
        $("#email-row").hide(200);
        $("#username-row").show(200);
        $("#password-row").show(200);
        $("#reset").show(100);
        $("#login-form .form-switch").show(100);
        $("#username-login").focus();
        setState((prevState) => ({
          ...prevState,
          action: "Log In",
        }));
    }
  };

  const handleClose = () => {
    setShow(false);
    setState({
      email: "",
      username: "",
      password: "",
      action: "Log In",
    });
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
    const { username, password, email, action } = state;
    if (action === "Recover Account") {
      try {
        const res = await axios.post("api/user/reset", { email });
        console.log("res", res);
        toast.success("Check your email for a link to recover your account", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
        handleClose();
      } catch (err) {
        console.log("err", err);
        toast.error("Invalid email", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
      }
    } else {
      const signup = $("#signup-switch").prop("checked");
      const stayLoggedIn = $("#stay-logged-in").prop("checked");
      console.log("signup", signup);
      let res;
      try {
        res = signup
          ? await axios.post("api/user/signup", {
              email,
              username,
              password,
            })
          : await axios.post("api/user/login", {
              username,
              password,
            });
      } catch (err) {
        console.log("err", err);
        const message =
          err.response.status === 409
            ? "User with email or username already exists"
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
      setContext({
        ...Context,
        stayLoggedIn: stayLoggedIn.toString(),
        user,
        loggedIn: "true",
      });
      if (stayLoggedIn) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("stayLoggedIn", "true");
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("stayLoggedIn", "false");
      }
      const message = user.first_name
        ? `${user.first_name} ${user.last_name} logged in`
        : `${user.username} logged in`;
      toast.success(message, {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
    }
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
            <Col xs={2} id="reset-back" onClick={handleClick} F>
              <TiArrowBackOutline className="back-arrow" />
            </Col>
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
          <Row id="email-row" className="px-3">
            <InputGroup className="">
              <FloatingLabel label="Email">
                <Form.Control
                  required={state.action !== "Log In"}
                  id="email-login"
                  type="email"
                  name="email"
                  value={state.email}
                  onChange={handleChange}
                />
              </FloatingLabel>
            </InputGroup>
          </Row>
          <Row id="username-row" className="px-3">
            <InputGroup className="mt-3">
              <FloatingLabel label="Username">
                <Form.Control
                  required={state.action !== "Recover Account"}
                  id="username-login"
                  type="text"
                  name="username"
                  value={state.username}
                  onChange={handleChange}
                />
              </FloatingLabel>
            </InputGroup>
            <p className="link" id="reset" onClick={handleClick}>
              Forgot Username or Password?
            </p>
          </Row>
          <Row id="password-row" className="px-3">
            <InputGroup className="my-3">
              <FloatingLabel label="Password">
                <Form.Control
                  required={state.action !== "Recover Account"}
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
                {state.action}
              </Button>
              <Form.Check
                id="stay-logged-in"
                type="checkbox"
                label="Keep me logged in"
                className=""
                inline
              />
            </Col>
            {/* <Col className="d-flex align-items-center"></Col> */}
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Login;
