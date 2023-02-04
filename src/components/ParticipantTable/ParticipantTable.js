import React, { useEffect, useState, useContext, useCallback } from "react";
import { renderToString } from "react-dom/server";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css";
import { Filters, Coaches } from "./index.js";
import { Login } from "../index.js";
import axios from "axios";
import _ from "lodash";
import { DateTime } from "luxon";
import $ from "jquery";
import {
  BsFillCheckCircleFill,
  BsXCircleFill,
  BsFillPlusCircleFill,
  BsFillDashCircleFill,
} from "react-icons/bs/index.esm.js";
import { Button } from "react-bootstrap";
import { AppContext } from "../../App.js";
import "./style.css";
import { toast, Flip } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ParticipantTable = () => {
  const [races, setRaces] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [Context, setContext] = useContext(AppContext);
  const [tableData, setTableData] = useState([]);

  const { user } = Context;
  const navigate = useNavigate();

  console.log("Context", Context);

  const getRaces = async () => {
    const { data } = await axios.get("/race");
    console.log("data", data);
    return data;
  };

  const getParticipants = async () => {
    const { data } = await axios.get("/participant");
    return data;
  };

  const checkInOutFormatter = (cell) => {
    //get component html
    const value = cell.getValue();
    return value
      ? renderToString(
          <BsFillCheckCircleFill className="check" color="green" />
        )
      : renderToString(<BsXCircleFill className="ex" color="red" />);
  };

  const checkInOutMutator = (value, data, type, params, component) => {
    //check if participant checked in / returns true or false
    const field = component?.getField() || params?.field;
    //search for selected race & date
    const selectedRace = $(`#race-select option:selected`).text();
    const thisRace = _.find(data.races, (r) => r.name === selectedRace) || {};
    const selectedDate = $(`#race-date`).val();
    //check if attendance exists for race & date
    const attendance = _.find(
      thisRace.attendance,
      (a) => a.date === selectedDate
    ) || {
      [field]: false,
    };
    return attendance[field]; //ex
  };

  const startFinishMutator = (value, data, type, mutatorParams, component) => {
    //get start or finish time
    const field = component.getField();
    //search for selected race & date
    const selectedRace = $(`#race-select option:selected`).text();
    const thisRace = _.find(data.races, (r) => r.name === selectedRace) || {};
    if (!thisRace.attendance) return;

    const selectedDate = $(`#race-date`).val();
    const update = _.find(thisRace.attendance, (a) => a.date === selectedDate);

    if (!update || !update[field]) return;

    return DateTime.fromMillis(update[field]).toFormat("hh:mm a");
  };

  const startFinishFormatter = (cell) => {
    //italics if checked in & not checked out / bold if checked in & checked out
    const value = cell.getValue() || "";
    const data = cell.getRow().getData();
    const { checkedOut, checkedIn } = data;
    return checkedOut && checkedIn
      ? `<b>${value}</b>`
      : `<i>${value}</i>`;
  };

  const toggleCollapse = useCallback(() => {
    const toggle = $("#collapse-toggle");
    const collapsed = toggle.data("collapsed");
    console.log("collapsed", collapsed);
    toggle.html(
      collapsed
        ? renderToString(<BsFillDashCircleFill />)
        : renderToString(<BsFillPlusCircleFill />)
    );
    $(".tabulator-responsive-collapse").each(
      (i, el) => (el.style.display = collapsed ? "" : "none")
    );
    $(".tabulator-responsive-collapse-toggle-open").each((i, el) => {
      el.style.display = collapsed ? "none" : "initial";
      $(el).data("collapsed", !collapsed);
    });
    $(".tabulator-responsive-collapse-toggle-close").each((i, el) => {
      el.style.display = collapsed ? "initial" : "none";
      $(el).data("collapsed", collapsed);
    });
    $("#collapse-toggle").data("collapsed", !collapsed);
  }, []);

  // const toggleCellCollapse = useCallback((e) => {
  //   const target = $(e.target);
  //   const collapsed = target.data("collapsed");
  //   target.css("display", collapsed ? "none" : "");
  // target.data("collapsed", !collapsed);
  // }, []);

  useEffect(() => {
    //set table data when race context changes
    const { race } = Context;
    const table = Tabulator.findTable("#participant-table")[0];
    if (!table || !race || !race.name) return;

    table.setData(
      `/participant/${race.type}/${race.id}?eventIds=${race.eventIds}`
    );
  }, [Context]);

  // useEffect(() => {
  //   console.log("showCollapse", showCollapse);
  //   const toggle = $("#collapse-toggle");
  //   const collapsed = toggle.data("collapsed");
  //   console.log('collapsed', collapsed)
  //   toggle.html(
  //     collapsed
  //       ? renderToString(<BsFillDashCircleFill />)
  //       : renderToString(<BsFillPlusCircleFill />)
  //   );
  // }, [showCollapse]);

  useEffect(() => {
    //set race options, default race, and context
    getRaces().then((data) => {
      console.log("races", data);
      setRaces(data);
      setContext((prevcContext) => ({
        ...prevcContext,
        race: Context.race.name ? Context.race : data[0],
      }));
    });

    //create participant table
    const table = new Tabulator("#participant-table", {
      ajaxResponse: async (url, params, response) => {
        //add participant data from db to response
        const participants = await getParticipants();
        let updated = response.map((d) => {
          let participant = _.find(
            participants,
            (p) => p.user_id === d.user_id
          );
          return { ...d, ...participant };
        });
        const data = _.uniqBy(updated, "user_id");
        setTableData(data);
        return data;
      },
      layout: "fitColumns",
      placeholder: "No Participants",
      responsiveLayout: "collapse",
      responsiveLayoutCollapseStartOpen: false,
      responsiveLayoutCollapseFormatter: (data) => {
        let div = document.createElement("div");
        div.style.display = "flex";
        data.forEach((col) => {
          // console.log("col value", typeof col.value);
          div.innerHTML += col.value
            ? `<div class='col'><b>${col.title}:</b> ${col.value} </div>`
            : `<div class='col'><b>No ${col.title}</b></div> `;
        });
        return div;
      },
      height: "100%",
      pagination: true,
      paginationSize: 25,
      columnDefaults: {
        resizable: false,
      },
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
          formatter: "responsiveCollapse",
          headerSort: false,
          maxWidth: 45,
          titleFormatter: (column) => {
            return `<div id='collapse-toggle' data-collapsed='true'>${renderToString(
              <BsFillPlusCircleFill />
            )}</div>`;
          },
          headerClick: (e, column) => {
            toggleCollapse();
          },
          cellClick: (e, cell) => {
            // toggleCellCollapse(e);
          },
        },
        {
          title: "Name",
          field: "name",
          visible: true,
          mutator: (value, data) => {
            return `${data.first_name} ${data.last_name}`;
          },
          minWidth: 120,
          widthGrow: 2,
        },
        {
          title: "First",
          field: "first_name",
          formatter: (cell) => `<b>${cell.getValue()}</b>`,
          responsive: 0,
          minWidth: 100,
          visible: false,
        },
        {
          title: "Last",
          field: "last_name",
          formatter: (cell) => `<b>${cell.getValue()}</b>`,
          responsive: 0,
          minWidth: 100,
          visible: false,
        },
        {
          title: "In",
          field: "checkedIn",
          maxWidth: 105,
          minWidth: 70,
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
          maxWidth: 105,
          minWidth: 90,
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
          responsive: 4,
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
      ],
    });
    table.on("rowClick", (e, row) => {
      console.log("rowClick", row);
      setContext((prevcContext) => ({
        ...prevcContext,
        participant: row.getData(),
      }));

      navigate(`/profile/${row.getData().user_id}/checkin`);
    });

    table.on("tableBuilt", () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Coaches tableData={tableData} />
      <Button
        id="check-in"
        variant="danger"
        onClick={() => {
          setContext((prevcContext) => ({
            ...prevcContext,
            participant: user,
          }));
          navigate(`/profile/${user.user_id}/checkin`);
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
      <Login show={showLogin} setShow={setShowLogin} races={races} />
      <Filters
        races={races}
        tableData={tableData}
        Context={Context}
        toggleCollapse={toggleCollapse}
      />
      <div className="mx-3 " id="participant-table" />
    </>
  );
};

export default ParticipantTable;
