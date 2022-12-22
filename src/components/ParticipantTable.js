import React, { useEffect, useState, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import CheckInOut from "./CheckInOut.js";

const ParticipantTable = () => {
  const [showCheck, setShowCheck] = useState(false);
  const [member, setMember] = useState({});
  const tableRef = useRef(null);

  // const getMembers = async (table) => {
  //   const { data } = await axios.get("http://localhost:5000/member");
  //   console.log("data", data);
  //   if (!data) return;
  //   table.setData(data);
  // };

  useEffect(() => {
    // getMembers();
    const table = new Tabulator("#participantTable", {
      ajaxURL: "http://localhost:5000/member",
      layout: "fitColumns",

      columns: [
        { title: "ID", field: "id" },
        { title: "First Name", field: "firstName" },
        { title: "Last Name", field: "lastName" },
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
    });
  }, []);

  return (
    <>
      <CheckInOut show={showCheck} setShow={setShowCheck} member={member} />
      <div id="participantTable" ref={tableRef} />
    </>
  );
};

export default ParticipantTable;
