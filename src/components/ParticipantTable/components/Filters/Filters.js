import { useEffect, useState, useContext, useCallback } from "react";
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
import {
  MdOutlineClear,
  MdOutlineAllInclusive,
} from "react-icons/md/index.esm.js";
import { BsCheck2Circle, BsXCircle } from "react-icons/bs/index.esm.js";
import { AppContext } from "../../../../App.js";
// import _ from "lodash";
import { Duration } from "luxon";

const Filters = ({ races, tableData, toggleCollapse }) => {
  //filter by name and checked in true/false
  const [name, setName] = useState("");
  const [checkedIn, setCheckedIn] = useState("both");
  const [checkedOut, setCheckedOut] = useState("both");
  const [Context, setContext] = useContext(AppContext);
  const [count, setCount] = useState({
    in: tableData.length,
    out: tableData.length,
  });
  const [stats, setStats] = useState({
    totalMileage: 0,
  });

  const getCount = useCallback(
    (table) => {
      table = table || Tabulator.findTable("#participant-table")[0];
      if (!table) return { in: 0, out: 0 };
      const data = table.getData("active");
      const inCount = checkedIn
        ? data.filter((d) => d.checkedIn).length
        : data.filter((d) => !d.checkedIn).length;

      const outCount = checkedOut
        ? data.filter((d) => d.checkedOut).length
        : data.filter((d) => !d.checkedOut).length;

      return { in: inCount, out: outCount };
    },
    [checkedIn, checkedOut]
  );

  const handleChange = (e) => {
    e.preventDefault();
    const table = Tabulator.findTable("#participant-table")[0];
    const { id, name, value, selectedOptions } = e.target;

    if (id === "name-filter") {
      setName(value);
    } else if (name === "checkedIn") {
      setCheckedIn(checkedIn === "both" ? true : checkedIn ? false : "both");
    } else if (name === "checkedOut") {
      setCheckedOut(checkedOut === "both" ? true : checkedOut ? false : "both");
    } else if (id === "race-select") {
      const [raceId, type] = value.split("-");
      const eventIds = selectedOptions[0].dataset.eventids;
      const raceName = selectedOptions[0].innerText;

      setContext((prev) => ({
        ...prev,
        race: { id: Number(raceId), name: raceName, type, eventIds },
      }));
    } else if (id === "race-date") {
      setContext((prev) => ({ ...prev, date: value }));
      table.setData();
    }
  };

  useEffect(() => {
    const { race } = Context;
    //get attendance with Context.date
    const races = tableData
      .map(
        (p) =>
          p.races
            ?.filter((r) => r.id === race.id)[0]
            ?.attendance?.filter((a) => a.date === Context.date)[0]
      )
      //filter undefined / null values
      .filter((r) => r);
    //get total mileage and duration
    const totalMileage = races.reduce(
      (acc, curr) => acc + curr.mileage || 0,
      0
    );

    let totalDuration = races.reduce((acc, curr) => {
      delete curr.duration._id;
      const duration = Duration.fromObject(curr.duration || { hours: 0 }).as(
        "seconds"
      );
      return acc + duration;
    }, 0);

    totalDuration = Duration.fromObject({ seconds: totalDuration })
      .shiftTo("hours", "minutes", "seconds")
      .toObject();

    const { hours, minutes, seconds } = totalDuration;

    //create string for display
    totalDuration = `${hours ? hours + "h" : ""} ${
      minutes ? minutes + "m" : ""
    } ${seconds + "s"}`;

    setStats({ totalMileage, totalDuration });
    setCount(getCount());
  }, [Context, getCount, tableData]);

  useEffect(() => {
    const { race } = Context;
    if (!races) return;
    //change race input when context changes
    document.getElementById("race-select").options.selectedIndex =
      races?.findIndex((r) => r.id === race.id);
  }, [Context, races]);

  const nameFilter = ({ data, name }) => {
    return data.name.toLowerCase().includes(name.toLowerCase());
  };

  useEffect(() => {
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table) return;
    //get current name filter
    const tableFilters = table.getFilters();
    const filterInd = tableFilters.findIndex((f) => f.value === "name");

    if (name) {
      if (filterInd > -1) {
        //update existing filter
        const filter = tableFilters[filterInd];
        filter.field = (row) => {
          return nameFilter({ data: row, name });
        };
        tableFilters[filterInd] = filter;
        table.setFilter(tableFilters);
      } else {
        //add new filter
        table.addFilter(
          (row) => {
            return nameFilter({ data: row, name });
          },
          "function",
          "name"
        );
      }
    } else {
      //remove filter
      tableFilters.splice(filterInd, 1);
      table.setFilter(tableFilters);
    }
  }, [name]);

  useEffect(() => {
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table) return;

    //remove current checkedIn filter
    const filters = table.getFilters().filter((f) => f.field === "checkedIn");
    filters.forEach((f) => table.removeFilter(f.field, f.type, f.value));

    if (checkedIn !== "both")
      checkedIn
        ? table.addFilter("checkedIn", "=", true)
        : table.addFilter("checkedIn", "=", false);

    setCount(getCount(table));
    toggleCollapse();
  }, [checkedIn, getCount, toggleCollapse]);

  useEffect(() => {
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table) return;

    //remove current checkedOut filter
    const filters = table.getFilters().filter((f) => f.field === "checkedOut");
    filters.forEach((f) => table.removeFilter(f.field, f.type, f.value));

    if (checkedOut !== "both")
      checkedOut
        ? table.addFilter("checkedOut", "=", true)
        : table.addFilter("checkedOut", "=", false);

    setCount(getCount(table));
    toggleCollapse();
  }, [checkedOut, getCount, toggleCollapse]);

  return (
    <>
      <Row className="mx-2 mb-3">
        <InputGroup id="race-group" className="group">
          <FloatingLabel label="Race">
            <Form.Select
              id="race-select"
              aria-label="race-select"
              onChange={handleChange}
            >
              {races &&
                races.map((r) => (
                  <option
                    key={r.id}
                    value={`${r.id}-${r.type}`}
                    data-eventids={r.eventIds}
                  >
                    {r.name}
                  </option>
                ))}
            </Form.Select>
          </FloatingLabel>
          <FloatingLabel label="Date">
            <Form.Control
              type="date"
              id="race-date"
              aria-label="race-date"
              value={Context.date}
              onChange={handleChange}
            />
          </FloatingLabel>
        </InputGroup>
      </Row>
      <Row className="mx-2">
        <Form>
          <Row id="filter-row-2">
            <Col>
              <InputGroup id="name-group" className="mb-3">
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

            <Col className="d-flex justify-content-center align-items-center mb-3">
              <Button
                id="checked-in"
                name="checkedIn"
                variant="light"
                checked={checkedIn}
                onClick={handleChange}
                className={`${checkedIn}-btn`}
              >
                {checkedIn && checkedIn !== "both" ? (
                  <BsCheck2Circle />
                ) : checkedIn === "both" ? (
                  <MdOutlineAllInclusive size="1.2em" />
                ) : (
                  <BsXCircle />
                )}{" "}
                Checked In: {count.in}
              </Button>
              <Button
                id="checked-out"
                name="checkedOut"
                variant="light"
                checked={checkedOut}
                onClick={handleChange}
                className={`${checkedOut}-btn`}
              >
                {checkedOut && checkedOut !== "both" ? (
                  <BsCheck2Circle />
                ) : checkedOut === "both" ? (
                  <MdOutlineAllInclusive size="1.2em" />
                ) : (
                  <BsXCircle />
                )}{" "}
                Checked Out: {count.out}
              </Button>
            </Col>
          </Row>
        </Form>
        <ButtonGroup id="table-stats" className="mb-2 ">
          <Button variant="light" className="stat-button">
            <b>Total Miles:</b> {stats.totalMileage.toFixed(1)}
          </Button>
          {/* <Button variant="light" className="stat-button">
            <b>Total Duration:</b> {stats.totalDuration}
          </Button> */}
        </ButtonGroup>
      </Row>
    </>
  );
};

export default Filters;
