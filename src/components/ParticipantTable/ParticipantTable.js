import React, { useEffect, useState, useContext } from "react";
import { renderToString } from "react-dom/server";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css";
import { Filters } from "./index.js";
import { CheckInOut, Login } from "../index.js";
import axios from "axios";
import _ from "lodash";
import { DateTime } from "luxon";
import $ from "jquery";
import {
  BsFillCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs/index.esm.js";
import { Button } from "react-bootstrap";
import { UserContext } from "../../App.js";
import "./style.css";
import { toast, Flip } from "react-toastify";

const ParticipantTable = () => {
  const [showCheck, setShowCheck] = useState(false);
  const [participant, setParticipant] = useState({});
  const [races, setRaces] = useState([]);
  const [race, setRace] = useState({});
  const [date, setDate] = useState(DateTime.local().toISODate());
  const [table, setTable] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const User = useContext(UserContext);
  const { user } = User;

  console.log("User", User);

  const getRaces = async () => {
    const { data } = await axios.get("/race");
    return data;
  };

  const getParticipants = async (table) => {
    const { data } = await axios.get("/participant");
    return data;
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
        {
          title: "First",
          field: "first_name",
          formatter: (cell) => `<b>${cell.getValue()}</b>`,
        },
        {
          title: "Last",
          field: "last_name",
          formatter: (cell) => `<b>${cell.getValue()}</b>`,
        },
        {
          title: "In",
          field: "checkedIn",
          maxWidth: 100,
          hozAlign: "center",
          sorter: "boolean",
          headerHozAlign: "center",
          formatter: checkInOutFormatter,
          mutatorData: checkInOutMutator,
        },
        {
          title: "Out",
          field: "checkedOut",
          maxWidth: 100,
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
      let deferredPrompt;
      window.addEventListener("beforeinstallprompt", (e) => {
        deferredPrompt = e;
        $("#install-app").show();
      });

      const installApp = document.getElementById("install-app");
      installApp?.addEventListener("click", async () => {
        if (deferredPrompt !== null) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") {
            deferredPrompt = null;
          }
        }
      });
    });
    table.on("renderComplete", () => {
      //check if on mobile deice
      const windowWidth = window.innerWidth;
      const mobileCols = ["first_name", "last_name", "checkedOut", "checkedIn"];
      const nonMobileCols = [
        "first_name",
        "last_name",
        "checkedOut",
        "checkedIn",
        "start",
        "finish",
      ];
      const cols = windowWidth < 800 ? mobileCols : nonMobileCols;
      console.log("cols", cols);
      table.getColumns().forEach((col) => {
        const field = col.getField();
        if (cols.includes(field)) {
          col.show();
          col.getDefinition().visible = true;
        } else {
          col.hide();
          col.getDefinition().visible = false;
        }
      });
    });
  }, []);

  return (
    <>
      <Button
        id="check-in"
        variant="danger"
        onClick={() => {
          setParticipant(User.user);
          setShowCheck(true);
        }}
        className={User.loggedIn === "true" ? "" : "d-none"}
      >
        {user.first_name
          ? `${user.first_name} ${user.last_name}`
          : user.username}
      </Button>
      <Button
        id="login"
        variant="danger"
        name={User.loggedIn}
        onClick={() => {
          if (User.loggedIn === "true") {
            User.loggedIn = "false";
            User.user = {};
            localStorage.setItem("loggedIn", null);
            localStorage.setItem("user", JSON.stringify(null));
            sessionStorage.setItem("loggedIn", null);
            sessionStorage.setItem("user", JSON.stringify(null));
            setParticipant({});
            toast.error("Logged Out", {
              position: "top-center",
              transition: Flip,
              autoClose: 2000,
            });
          } else {
            setShowLogin(true);
          }
        }}
      >
        {User.loggedIn === "true" ? "Log Out" : "Log In"}
      </Button>
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
      <Login show={showLogin} setShow={setShowLogin} />
      <Filters
        setRace={setRace}
        races={races}
        setDate={setDate}
        date={date}
        table={table}
      />
      <div className="m-3 " id="participant-table" />
    </>
  );
};

export default ParticipantTable;
