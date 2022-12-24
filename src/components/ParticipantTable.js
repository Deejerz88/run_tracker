import React, { useEffect, useState, useRef } from "react";
import { Form, FloatingLabel, InputGroup } from "react-bootstrap";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import { CheckInOut } from "./index.js";
import axios from "axios";

const ParticipantTable = () => {
  const [showCheck, setShowCheck] = useState(false);
  const [participant, setParticipant] = useState({});
  const [races, setRaces] = useState([]);
  const [race, setRace] = useState({});
  const [table, setTable] = useState(null);

  // const getParticipants = async (table) => {
  //   const { data } = await axios.get("/participant");
  //   console.log("data", data);
  //   if (!data) return;
  //   table.setData(data);
  // };

  const getRaces = async () => {
    const { data } = await axios.get("/race");
    return data;
  };

  const handleChange = async (e) => {
    const [raceId, type] = e.target.value.split("-");
    const eventIds = e.target.selectedOptions[0].dataset.eventids;
    const raceName = e.target.selectedOptions[0].innerText;
    table.setData(`/participant/${type}/${raceId}?eventIds=${eventIds}`);
    setRace({ id: raceId, name: raceName, type, eventIds });
  };

  useEffect(() => {
    const table = new Tabulator("#participant-table", {
      ajaxURL: `/participant/club/1127`,
      layout: "fitColumns",
      pagination: true,
      paginationSize: 50,
      index: "user_id",
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
      setParticipant(row.getData());
      setShowCheck(true);
    });

    table.on("tableBuilt", () => {
      // console.log("table built");
      // getParticipants(table);
      getRaces().then((data) => {
        console.log('data', data)
        setRaces(data);
        console.log("race", data[0]);
        setRace(data[0]);
      });
    });
    setTable(table);
  }, []);

  return (
    <>
      <CheckInOut
        show={showCheck}
        setShow={setShowCheck}
        participant={participant}
        table={table}
        race={race}
      />
      <InputGroup className="m-3 w-50">
        <FloatingLabel label="Select Race">
          <Form.Select
            id="raceSelect"
            aria-label="Default select example"
            onChange={handleChange}
          >
            {races.map((r) => (
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
      </InputGroup>
      <h1>Participants</h1>
      <div className="m-3" id="participant-table" />
    </>
  );
};

export default ParticipantTable;
