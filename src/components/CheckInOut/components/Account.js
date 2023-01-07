import { useEffect, useState, useContext } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { startCase, isEqual } from "lodash";
import { toast, Flip } from "react-toastify";
import axios from "axios";
import $ from "jquery";
import { UserContext } from "../../../App.js";
import { Tabulator } from "tabulator-tables";

const Account = ({ participant }) => {
  console.log("participant", participant);

  const [User, setUser] = useContext(UserContext);
  const [originalData, setOriginalData] = useState({
    ...participant,
    change_password: "",
    confirm_password: "",
  });

  const [formData, setFormData] = useState({
    ...participant,
    change_password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    let { id, value } = e.target;
    console.log("id", id);
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

    console.log("key", key, "value", value);
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("submit");
    if (formData.change_password !== formData.confirm_password) {
      toast.error("Passwords do not match", {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
      return;
    }
    try {
      const { data } = await axios.post("/api/user", formData);
      const table = Tabulator.findTable("#participant-table")[0];
      console.log("data", data);
      $("#change_password").val("");
      $("#confirm_password").val("");
      $(".confirm_password").hide();
      setOriginalData(formData);
      console.log("tableData", table.getData());
      setUser((prevState) => ({
        ...prevState,
        user: { ...prevState.user, ...formData },
      }));
      toast.success("Account updated", {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
      const { user } = data;
      table.updateData([{ ...user }]);
    } catch (err) {
      console.log("err", err);
      toast.error("Error updating account", {
        position: "top-center",
        autoClose: 3000,
        transition: Flip,
      });
    }
  };

  useEffect(() => {
    console.log("formData", formData, "originalData", originalData);
    if (!isEqual(formData, originalData)) {
      console.log("changed");
      $("#submit-row").show();
    } else {
      console.log("not changed");
      $("#submit-row").hide();
    }
  }, [formData, originalData]);

  return (
    <Form id="account-form" onSubmit={handleSubmit}>
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
          <Form.Group key={field} as={Row} className={`m-3 ${field}`}>
            <Form.Label column sm={2}>
              <b>{startCase(field.replace(/_/g, " "))}</b>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                id={field}
                type={type}
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
      <div id="submit-row">
        <Row>
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
              }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default Account;
