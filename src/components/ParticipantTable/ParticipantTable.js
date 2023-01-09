import React, { useEffect, useState, useContext } from "react";
import { renderToString } from "react-dom/server";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css";
import { Filters } from "./index.js";
import { Profile, Login } from "../index.js";
import axios from "axios";
import _ from "lodash";
import { DateTime } from "luxon";
import $ from "jquery";
import {
  BsFillCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs/index.esm.js";
import { Button } from "react-bootstrap";
import { AppContext } from "../../App.js";
import "./style.css";
import { toast, Flip } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ParticipantTable = () => {
  const [races, setRaces] = useState([]);
  const [table, setTable] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [Context, setContext] = useContext(AppContext);
  const { user } = Context;
  const navigate = useNavigate();

  console.log("Context", Context);

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
    const bool = _.find(
      thisRace.attendance,
      (a) => a.date === selectedDate
    ) || {
      [field]: false,
    };
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
    const { race } = Context;
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table || !race.name) return;
    table.setData(
      `/participant/${race.type}/${race.id}?eventIds=${race.eventIds}`
    );
  }, [Context]);

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
      setContext((prevcContext) => ({
        ...prevcContext,
        race: Context.race.name ? Context.race : data[0],
      }));
      console.log("Context.race", Context);
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
      responsiveLayout: "hide",
      // footerElement: "<div id='footer' class='tabulator-footer'></div>",
      height: "100%",
      pagination: true,
      paginationSize: 25,
      // paginationSizeSelector: [25, 50, 100],
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
          // responsive: 0,
          minWidth: 100,
        },
        {
          title: "Last",
          field: "last_name",
          formatter: (cell) => `<b>${cell.getValue()}</b>`,
          // responsive: 0,
          minWidth: 100,
        },
        {
          title: "In",
          field: "checkedIn",
          maxWidth: 90,
          minWidth:80,
          hozAlign: "center",
          sorter: "boolean",
          headerHozAlign: "center",
          formatter: checkInOutFormatter,
          mutatorData: checkInOutMutator,
          responsive: 2,
        },
        {
          title: "Out",
          field: "checkedOut",
          maxWidth: 90,
          minWidth: 80,
          hozAlign: "center",
          headerHozAlign: "center",
          sorter: "boolean",
          formatter: checkInOutFormatter,
          mutatorData: checkInOutMutator,
          responsive: 1,
        },
        {
          title: "Start",
          field: "start",
          maxWidth: 120,
          minWidth: 110,
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
          responsive: 3,
        },
        {
          title: "Finish",
          field: "finish",
          maxWidth: 120,
          minWidth: 110,
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
          responsive: 3,
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
      // setParticipant(row.getData());
      // setShowCheck(true);
      setContext((prevcContext) => ({
        ...prevcContext,
        participant: row.getData(),
      }));

      navigate(`/profile/${row.getData().user_id}`);
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
    });
  }, []);

  return (
    <>
      <Button
        id="check-in"
        variant="danger"
        onClick={() => {
          setContext((prevcContext) => ({
            ...prevcContext,
            participant: user,
          }));
          navigate(`/profile/${user.user_id}`);
        }}
        className={Context.loggedIn === "true" ? "" : "d-none"}
      >
        {user.first_name
          ? `${user.first_name} ${user.last_name}`
          : user.username}
      </Button>
      <Button
        id="login"
        variant="danger"
        name={Context.loggedIn}
        onClick={() => {
          if (Context.loggedIn === "true") {
            setContext((prevcContext) => ({
              ...prevcContext,
              loggedIn: "false",
              user: {},
              participant: {},
            }));
            localStorage.setItem("loggedIn", null);
            localStorage.setItem("user", JSON.stringify(null));
            sessionStorage.setItem("loggedIn", null);
            sessionStorage.setItem("user", JSON.stringify(null));
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
        {Context.loggedIn === "true" ? "Log Out" : "Log In"}
      </Button>
      <Login show={showLogin} setShow={setShowLogin} />
      <Filters races={races} table={table} />
      <div className="m-3 " id="participant-table" />
    </>
  );
};

export default ParticipantTable;
