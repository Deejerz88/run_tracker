import React, { useEffect, useState } from "react";
import { renderToString } from "react-dom/server";
import { Form, FloatingLabel, InputGroup } from "react-bootstrap";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css";
import { CheckInOut } from "./index.js";
import axios from "axios";
import _ from "lodash";
import { DateTime } from "luxon";
import $ from "jquery";
import {
  BsFillCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs/index.esm.js";
import "./style.css";

const ParticipantTable = () => {
  const [showCheck, setShowCheck] = useState(false);
  const [participant, setParticipant] = useState({});
  const [races, setRaces] = useState([]);
  const [race, setRace] = useState({});
  const [table, setTable] = useState(null);

  const getRaces = async () => {
    const { data } = await axios.get("/race");
    return data;
  };

  const getParticipants = async (table) => {
    const { data } = await axios.get("/participant");
    console.log("participants", data);
    // table.updateData(data);
    // table.redraw(true);
    return data;
  };

  const handleChange = async (e) => {
    const [raceId, type] = e.target.value.split("-");
    const eventIds = e.target.selectedOptions[0].dataset.eventids;
    const raceName = e.target.selectedOptions[0].innerText;
    setRace({ id: raceId, name: raceName, type, eventIds });
  };

  const checkInOutFormatter = (cell) => {
    const data = cell.getRow().getData();
    const field = cell.getField();
    const selectedRace = $(`#race-select option:selected`).text();
    const thisRace = _.find(data.races, (r) => r.name === selectedRace) || {};
    console.log("thisRace formatter", thisRace);
    const today = DateTime.local().toISODate();
    const bool = _.find(thisRace.attendance, (a) => a.date === today) || {
      [field]: false,
    };
    console.log("name", data.first_name, "field", field, "bool", bool[field]);
    return bool[field]
      ? renderToString(<BsFillCheckCircleFill color="green" />)
      : renderToString(<BsXCircleFill color="red" />);
  };

  const checkInOutMutator = (value, data, type, params, component) => {
    const field = component.getField();
    const selectedRace = $(`#race-select option:selected`).text();
    const thisRace = _.find(data.races, (r) => r.name === selectedRace) || {};
    const today = DateTime.local().toISODate();
    const bool = _.find(thisRace.attendance, (a) => a.date === today) || {
      [field]: false,
    };
    return bool[field];
  };
  const startFinishMutator = (value, data, type, mutatorParams, component) => {
    const field = component.getField();

    const selectedRace = $(`#race-select option:selected`).text();
    const thisRace = _.find(data.races, (r) => r.name === selectedRace) || {};
    console.log("return formatter", thisRace);
    if (!thisRace.attendance) return;
    const today = DateTime.local().toISODate();
    const update = _.find(thisRace.attendance, (a) => a.date === today);
    return DateTime.fromMillis(update[field]).toFormat("hh:mm a");
  };

  useEffect(() => {
    if (!race.name) return;
    const table = Tabulator.findTable("#participant-table")[0];
    table
      .setData(`/participant/${race.type}/${race.id}?eventIds=${race.eventIds}`)
      // .then(() => {
      //   console.log("race", race);
      //   getParticipants(table);
      // });
  }, [race]);

  useEffect(() => {
    getRaces().then((data) => {
      console.log("data", data);
      setRaces(data);
      setRace(data[0]);
    });
    const table = new Tabulator("#participant-table", {
      ajaxResponse: async (url, params, response) => {
        const participants = await getParticipants(table)
        let updated = response.map((d) => {
          const participant = _.find(
            participants,
            (p) => p.user_id === d.user_id
          );
          return { ...d, ...participant };
        });
        console.log("updated", updated);
        return _.uniqBy(updated, "user_id");
      },
      layout: "fitColumns",
      pagination: true,
      paginationSize: 50,
      index: "user_id",
      columns: [
        { title: "ID", field: "user_id", visible: false },
        { title: "First Name", field: "first_name" },
        { title: "Last Name", field: "last_name" },
        {
          title: "Checked In",
          field: "checkedIn",
          maxWidth: 150,
          hozAlign: "center",
          headerHozAlign: "center",
          formatter: checkInOutFormatter,
          mutatorData: checkInOutMutator,
        },
        {
          title: "Checked Out",
          field: "checkedOut",
          maxWidth: 150,
          hozAlign: "center",
          headerHozAlign: "center",
          formatter: checkInOutFormatter,
          mutatorData: checkInOutMutator,
        },
        {
          title: "Start",
          field: "start",
          maxWidth: 120,
          hozAlign: "center",
          headerHozAlign: "center",
          mutator: startFinishMutator,
        },
        {
          title: "Finish",
          field: "finish",
          maxWidth: 120,
          hozAlign: "center",
          headerHozAlign: "center",
          mutator: startFinishMutator,
        },
      ],
    });
    table.on("rowClick", (e, row) => {
      console.log("rowClick", row);
      setParticipant(row.getData());
      setShowCheck(true);
    });

    table.on("tableBuilt", () => {
      setTable(table);
    });
  }, []);

  return (
    <>
      <CheckInOut
        show={showCheck}
        setShow={setShowCheck}
        participant={participant}
        setParticipant={setParticipant}
        table={table}
        race={race}
        setRace={setRace}
      />
      <InputGroup className="m-3 w-50">
        <FloatingLabel label="Select Race">
          <Form.Select
            id="race-select"
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
      <h1 className="text-dark">Participants</h1>
      <div className="m-3 " id="participant-table" />
    </>
  );
};

export default ParticipantTable;
