import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { startCase, isEqual } from "lodash";
import { toast, Flip } from "react-toastify";
import axios from "axios";
import $ from "jquery";
import { Feedback } from "./index.js";

const Account = ({ Context, setContext }) => {
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

  const handleChange = (e) => {
    let { id, value } = e.target;
    if (id === "phone") {
      //format phone number
      value = value.replace(/(\D|-|\(|\))/g, "");
      const formatted = value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      e.target.value = formatted;
    } else if (id === "change_password") {
      //show confirm password field
      value
        ? $(".confirm_password").css({ display: "flex" })
        : $(".confirm_password").css({ display: "none" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("submit", formData);
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
      console.log("formData", formData);
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
    }
  };

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
          //set input type
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
        <Row
          id="submit-row"
          style={{ display: isEqual(formData, originalData) ? "none" : "flex" }}
        >
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
      <Feedback participant={participant} race={race} />
    </>
  );
};

export default Account;
