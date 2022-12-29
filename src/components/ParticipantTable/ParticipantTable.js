import React, { useEffect, useState } from "react";
import { renderToString } from "react-dom/server";
import { Form, FloatingLabel, InputGroup } from "react-bootstrap";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css";
import { Filters } from "./index.js";
import { CheckInOut } from "../index.js";
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
  const [date, setDate] = useState(DateTime.local().toISODate());
  const [table, setTable] = useState(null);

  const getRaces = async () => {
    const { data } = await axios.get("/race");
    return data;
  };

  const getParticipants = async (table) => {
    const { data } = await axios.get("/participant");
    return data;
  };

  const handleChange = async (e) => {
    const { id, value, selectedOptions } = e.target;
    if (id === "race-select") {
      const [raceId, type] = value.split("-");
      const eventIds = selectedOptions[0].dataset.eventids;
      const raceName = selectedOptions[0].innerText;
      setRace({ id: Number(raceId), name: raceName, type, eventIds });
    } else if (id === "race-date") {
      console.log("date", value);
      setDate(value);
      table.setData();
      // table.getRows().forEach((row) => {
      //   const data = row.getData();
      //   const checkedIn = checkInOutMutator(
      //     null,
      //     data,
      //     null,
      //     { field: "checkedIn" },
      //   );
      //   const checkedOut = checkInOutMutator(
      //     null,
      //     data,
      //     null,
      //     { field: "checkedIn" },
      //   );
      //   row.update({ checkedIn, checkedOut, date: value, date2: value });
      // });
      // const participants = await getParticipants(table);
      // table.updateData(participants);
      // table.redraw(true);
    }
  };

  const checkInOutFormatter = (cell) => {
    const value = cell.getValue();
    return value
      ? renderToString(
          <BsFillCheckCircleFill className="check" color="green" />
        )
      : renderToString(<BsXCircleFill className="ex" color="red" />);
  };

  const checkInOutMutator = (value, data, type, params, component) => {
    const field = component?.getField() || params?.field;
    const selectedRace = $(`#race-select option:selected`).text();
    const thisRace = _.find(data.races, (r) => r.name === selectedRace) || {};
    const selectedDate = $(`#race-date`).val();
    // console.log("selectedDate", selectedDate);
    const bool = _.find(
      thisRace.attendance,
      (a) => a.date === selectedDate
    ) || {
      [field]: false,
    };
    // console.log("bool", bool[field]);
    return bool[field];
  };

  const startFinishMutator = (value, data, type, mutatorParams, component) => {
    const field = component.getField();

    const selectedRace = $(`#race-select option:selected`).text();
    const thisRace = _.find(data.races, (r) => r.name === selectedRace) || {};
    if (!thisRace.attendance) return;
    const selectedDate = $(`#race-date`).val();
    const update = _.find(thisRace.attendance, (a) => a.date === selectedDate);
    if (!update) return;
    return DateTime.fromMillis(update[field]).toFormat("hh:mm a");
  };

  useEffect(() => {
    if (!race.name) return;
    const table = Tabulator.findTable("#participant-table")[0];
    table.setData(
      `/participant/${race.type}/${race.id}?eventIds=${race.eventIds}`
    );
  }, [race]);

  const startFinishFormatter = (cell) => {
    const value = cell.getValue() || "";
    // console.log('value', value)
    const data = cell.getRow().getData();
    // console.log('data', data)
    const { checkedOut, checkedIn } = data;
    return checkedOut && checkedIn ? `<b>${value}</b>` : `<em>${value}</em>`;
  };

  useEffect(() => {
    getRaces().then((data) => {
      setRaces(data);
      console.log("races: ", data);
      setRace(data[0]);
    });
    const table = new Tabulator("#participant-table", {
      ajaxResponse: async (url, params, response) => {
        const participants = await getParticipants(table);
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
      placeholder: "No Participants",
      footerElement: "<div id='footer' class='tabulator-footer'></div>",
      height: "100%",
      // pagination: true,
      // paginationSize: 50,
      initialSort: [
        { column: "last_name", dir: "asc" },
        {
          column: "finish",
          dir: "asc",
        },
      ],
      index: "user_id",
      columns: [
        { title: "ID", field: "user_id", visible: false },
        { title: "First Name", field: "first_name", formatter: (cell) => `<b>${cell.getValue()}</b>` },
        { title: "Last Name", field: "last_name", formatter: (cell) => `<b>${cell.getValue()}</b>`  },
        {
          title: "Checked In",
          field: "checkedIn",
          maxWidth: 170,
          hozAlign: "center",
          sorter: "boolean",
          headerHozAlign: "center",
          formatter: checkInOutFormatter,
          mutatorData: checkInOutMutator,
        },
        {
          title: "Checked Out",
          field: "checkedOut",
          maxWidth: 170,
          hozAlign: "center",
          headerHozAlign: "center",
          sorter: "boolean",
          formatter: checkInOutFormatter,
          mutatorData: checkInOutMutator,
        },
        {
          title: "Start",
          field: "start",
          maxWidth: 140,
          hozAlign: "center",
          sorter: function (a, b, aRow, bRow, column, dir, sorterParams) {
            return (
              DateTime.fromFormat(a, "hh:mm a").toMillis() -
              DateTime.fromFormat(b, "hh:mm a").toMillis()
            );
          },
          headerHozAlign: "center",
          mutator: startFinishMutator,
          formatter: startFinishFormatter,
        },
        {
          title: "Finish",
          field: "finish",
          maxWidth: 140,
          hozAlign: "center",
          headerHozAlign: "center",
          sorter: function (a, b, aRow, bRow, column, dir, sorterParams) {
            return (
              DateTime.fromFormat(a, "hh:mm a").toMillis() -
              DateTime.fromFormat(b, "hh:mm a").toMillis()
            );
          },
          mutator: startFinishMutator,
          formatter: startFinishFormatter,
        },
        {
          title: "Name",
          field: "name",
          visible: false,
          mutator: (value, data) => {
            return `${data.first_name} ${data.last_name}`;
          },
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
        date={date}
      />
      <InputGroup id="race-group" className="m-3 group">
        <FloatingLabel label="Race">
          <Form.Select
            id="race-select"
            aria-label="race-select"
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
        <FloatingLabel label="Date">
          <Form.Control
            type="date"
            id="race-date"
            aria-label="race-date"
            value={date}
            onChange={handleChange}
          />
        </FloatingLabel>
      </InputGroup>
      <Filters />
      {/* <h1 className="text-dark">Participants</h1> */}
      <div className="m-3 " id="participant-table" />
    </>
  );
};

export default ParticipantTable;
