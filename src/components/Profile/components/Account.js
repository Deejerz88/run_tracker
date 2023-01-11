import { useEffect, useState, useContext } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { startCase, isEqual } from "lodash";
import { toast, Flip } from "react-toastify";
import axios from "axios";
import $ from "jquery";
import { AppContext } from "../../../App.js";

const Account = () => {
  const [Context, setContext] = useContext(AppContext);
  const { participant, race } = Context;
  const { first_name, last_name, username, email, phone } = participant;
  const [originalData, setOriginalData] = useState({
    first_name,
    last_name,
    username,
    email,
    phone,
    change_password: "",
    confirm_password: "",
  });

  const [formData, setFormData] = useState({
    first_name,
    last_name,
    username,
    email,
    phone,
    change_password: "",
    confirm_password: "",
  });

  const [feedbackData, setFeedbackData] = useState({
    subject: "",
    message: "",
    anonymous: false,
  });

  const handleChange = (e) => {
    const form = e.target.form;
    let { id, value } = e.target;
    let key = id.replace(/ /g, "_");
    key = key.toLowerCase();
    if (id === "phone") {
      value = value.replace(/(\D|-|\(|\))/g, "");
      const formatted = value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      e.target.value = formatted;
    } else if (id === "change_password") {
      value
        ? $(".confirm_password").css({ display: "flex" })
        : $(".confirm_password").css({ display: "none" });
    }
    form.id === "feedback-form"
      ? setFeedbackData((prev) => ({ ...prev, [key]: value }))
      : setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("submit");
    const form = e.target;
    if (form.id === "account-form") {
      if (formData.change_password !== formData.confirm_password) {
        toast.error("Passwords do not match", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
        return;
      }
      try {
        await axios.post("/api/user", formData);
        $("#change_password").val("");
        $("#confirm_password").val("");
        $(".confirm_password").hide();
        setOriginalData({
          ...formData,
          change_password: "",
          confirm_password: "",
        });
        setFormData({
          ...formData,
          change_password: "",
          confirm_password: "",
        });
        setContext((prevState) => ({
          ...prevState,
          user: { ...prevState.user, ...formData },
        }));
        toast.success("Account updated", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
      } catch (err) {
        console.log("err", err);
        toast.error("Error updating account", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
      }
    } else if (form.id === "feedback-form") {
      const { subject, message } = feedbackData;
      if (!subject || !message) {
        toast.error("Please enter a subject and message", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
        return;
      }
      try {
        await axios.post("/feedback", {
          ...feedbackData,
          participant,
          race,
        });
        setFeedbackData({ subject: "", message: "" });
        $("#subject").val("");
        $("#message").val("");
        $("#anonymous").prop("checked", false);
        toast.success("Feedback submitted", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
      } catch (err) {
        console.log("err", err);
        toast.error("Error submitting feedback", {
          position: "top-center",
          autoClose: 3000,
          transition: Flip,
        });
      }
    }
  };

  useEffect(() => {
    const { subject, message } = feedbackData;
    if (subject && message) {
      $("#submit-feedback-row").css({ display: "flex" });
    } else {
      $("#submit-feedback-row").hide();
    }
  }, [feedbackData]);

  useEffect(() => {
    if (!isEqual(formData, originalData)) {
      $("#submit-row").css({ display: "flex" });
    } else {
      console.log("not changed");
      $("#submit-row").hide();
    }
  }, [formData, originalData]);

  return (
    <>
      <Form id="account-form" onSubmit={handleSubmit}>
        <h2 className="styled-title">Account</h2>
        <hr className="styled-hr w-25 mt-2" />
        {[
          "first_name",
          "last_name",
          "username",
          "email",
          "phone",
          "change_password",
          "confirm_password",
        ].map((field) => {
          const type = field.includes("password")
            ? "password"
            : field === "phone"
            ? "tel"
            : "text";
          return (
            <Form.Group
              key={field}
              as={Row}
              className={`m-3 ${field} `}
              style={{
                display: field === "confirm_password" ? "none" : "flex",
              }}
            >
              <Form.Label column sm={2}>
                <b>{startCase(field.replace(/_/g, " "))}</b>
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  id={field}
                  type={type}
                  autoComplete={
                    field === "change_password" ? "new-password" : "on"
                  }
                  value={
                    formData.user_id && field === "phone"
                      ? formData[field]
                          .replace(/(\D|-|\(|\))/g, "")
                          .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
                      : formData[field]
                  }
                  disabled={field === "email"}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>
          );
        })}
        <Row id="submit-row">
          <Col className="d-flex justify-content-end">
            <Button variant="outline-danger" type="submit">
              Submit
            </Button>
          </Col>
          <Col>
            <Button
              variant="outline-danger"
              type="reset"
              onClick={() => {
                $("#submit-row").hide();
                setFormData(originalData);
                $(".confirm_password").css({ display: "none" });
              }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>
      <Form id="feedback-form" onSubmit={handleSubmit} onChange={handleChange}>
        <h2 className="styled-title">Feedback</h2>
        <hr className="styled-hr w-25 mt-2" />
        <Form.Group as={Row} className="m-3">
          <Form.Label column sm={2}>
            <b>Subject</b>
          </Form.Label>
          <Col sm={10}>
            <Form.Control id="subject" type="text" />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="m-3 mb-0">
          <Form.Label column sm={2}>
            <b>Message</b>
          </Form.Label>
          <Col sm={10}>
            <Form.Control id="message" as="textarea" rows={3} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mx-4 mb-3 mt-1">
          <Form.Label column sm={2}></Form.Label>
          <Col sm={10}>
            <Form.Check
              id="anonymous"
              type="checkbox"
              label="Submit anonymously"
            />
          </Col>
        </Form.Group>

        <Row id="submit-feedback-row">
          <Col className="d-flex justify-content-end">
            <Button variant="outline-danger" type="submit">
              Submit
            </Button>
          </Col>
          <Col>
            <Button
              variant="outline-danger"
              type="reset"
              onClick={() => {
                $("#submit-feedback-row").hide();
                setFeedbackData({ subject: "", message: "" });
              }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Account;
