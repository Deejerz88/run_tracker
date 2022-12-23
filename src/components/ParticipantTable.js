import React, { useEffect, useState, useRef } from "react";
import { Form, FloatingLabel, InputGroup } from "react-bootstrap";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import { CheckInOut } from "./index.js";
import axios from "axios";

const ParticipantTable = () => {
  const [showCheck, setShowCheck] = useState(false);
  const [member, setMember] = useState({});
  const [races, setRaces] = useState([]);

  // const getMembers = async (table) => {
  //   const { data } = await axios.get("/member");
  //   console.log("data", data);
  //   if (!data) return;
  //   table.setData(data);
  // };

  const getRaces = async () => {
    const { data } = await axios.get("/race");
    return data;
  };

  const handleChange = async (e) => {
    const table = Tabulator.findTable("#participant-table")[0];
    console.log("e.target", e.target);
    const { value } = e.target;
    const [raceId, type] = value.split("-");
    const eventIds = e.target.selectedOptions[0].dataset.eventids;
    console.log("value", value, "raceId", raceId, "type", type);
    console.log("table", table);
    table.setData(`/member/${type}/${raceId}?eventIds=${eventIds}`);
  };

  useEffect(() => {
    const table = new Tabulator("#participant-table", {
      ajaxURL: `/member/club/1127`,
      layout: "fitColumns",
      pagination: true,
      paginationSize: 50,
      columns: [
        { title: "ID", field: "user_id", visible: true },
        { title: "First Name", field: "first_name" },
        { title: "Last Name", field: "last_name" },
        { title: "checkIn", field: "checkIn", visible: false },
        { title: "checkOut", field: "checkOut", visible: false },
        {
          title: "Checked In",
          field: "checkedIn",
          maxWidth: 120,
          hozAlign: "center",
          headerHozAlign: "center",
        },
        {
          title: "Checked Out",
          field: "checkedOut",
          maxWidth: 120,
          hozAlign: "center",
          headerHozAlign: "center",
        },
      ],
    });
    table.on("rowClick", (e, row) => {
      console.log("rowClick", row);
      setMember(row.getData());
      setShowCheck(true);
    });

    table.on("tableBuilt", () => {
      // console.log("table built");
      // getMembers(table);
      getRaces().then((data) => setRaces(data));
    });
  }, []);

  return (
    <>
      <CheckInOut show={showCheck} setShow={setShowCheck} member={member} />
      <InputGroup className="m-3 w-50">
        <FloatingLabel label="Select Race">
          <Form.Select
            id="raceSelect"
            aria-label="Default select example"
            onChange={handleChange}
          >
            {races.map((race) => (
              <option
                key={race.id}
                value={`${race.id}-${race.type}`}
                data-eventids={race.eventIds}
              >
                {race.name}
              </option>
            ))}
          </Form.Select>
        </FloatingLabel>
      </InputGroup>
      <h1>Participants</h1>
      <div className="m-3" id="participant-table" />
    </>
  );
};

export default ParticipantTable;
