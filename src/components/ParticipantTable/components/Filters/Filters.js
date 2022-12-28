import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  ButtonGroup,
  InputGroup,
  FloatingLabel,
} from "react-bootstrap";
import "./style.css";
import { Tabulator } from "tabulator-tables";
import { MdOutlineClear } from "react-icons/md/index.esm.js";

const Filters = () => {
  //filter by name and checked in true/false
  const [name, setName] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const handleChange = (e) => {
    e.preventDefault();
    console.log("e", e.target.name, e.target.checked);
    const { id, name, value } = e.target;
    if (id === "name-filter") {
      setName(value);
    } else if (name === "checkedIn") {
      setCheckedIn(!checkedIn);
    } else if (name === "checkedOut") {
      setCheckedOut(!checkedOut);
    }
  };

  const nameFilter = ({ data, name }) => {
    return data.name.toLowerCase().includes(name.toLowerCase());
  };

  useEffect(() => {
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table) return;
    console.log("tableFilters", table.getFilters());
    const tableFilters = table.getFilters();
    const filterInd = tableFilters.findIndex((f) => f.value === "name");
    if (name) {
      if (filterInd > -1) {
        const filter = tableFilters[filterInd];
        filter.field = (row) => {
          return nameFilter({ data: row, name });
        };
        tableFilters[filterInd] = filter;
        table.setFilter(tableFilters);
      } else {
        table.addFilter(
          (row) => {
            return nameFilter({ data: row, name });
          },
          "function",
          "name"
        );
      }
    } else {
      tableFilters.splice(filterInd, 1);
      table.setFilter(tableFilters);
    }

    console.log("tableFitlers", table.getFilters());
  }, [name]);

  useEffect(() => {
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table) return;
    console.log("tableFilters", table.getFilters());
    checkedIn
      ? table.addFilter("checkedIn", "=", true)
      : table.removeFilter("checkedIn", "=", true);
    console.log("tableFilters", table.getFilters());
  }, [checkedIn]);

  useEffect(() => {
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table) return;
    console.log("tableFilters", table.getFilters());
    checkedOut
      ? table.addFilter("checkedOut", "=", true)
      : table.removeFilter("checkedOut", "=", true);
    console.log("tableFilters", table.getFilters());
  }, [checkedOut]);

  return (
    <Form>
      <Row>
        <Col xs={6}>
          <InputGroup id="name-group" className="m-3">
            <FloatingLabel label="Name">
              <Form.Control
                id="name-filter"
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
              />
            </FloatingLabel>
            <Button
              id="clear-name"
              variant="light"
              onClick={() => setName("")}
            >
              <MdOutlineClear id="name-x" />
            </Button>
          </InputGroup>
        </Col>
        <Col
          xs={6}
          className="d-flex justify-content-center align-items-center"
        >
          <ButtonGroup id='checkin-group' className="h-50" onClick={handleChange}>
            <Button
              id="checked-in"
              name="checkedIn"
              variant="light"
              checked={checkedIn}
              className={checkedIn ? "active " : ""}
            >
              Checked In
            </Button>
            <Button
              id="checked-out"
              name="checkedOut"
              variant="light"
              checked={checkedOut}
              className={checkedOut ? "active" : ""}
            >
              Checked Out
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </Form>
  );
};

export default Filters;
