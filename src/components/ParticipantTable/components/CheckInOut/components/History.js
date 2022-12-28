import React, { useEffect, useState } from "react";
import { Row, Col, Card, Container } from "react-bootstrap";
import { Tabulator } from "tabulator-tables";

const History = ({ participant }) => {
  const table = new Tabulator("#history-table", {
    columns: [
      {
        title: "Race",
        field: "race",
      },
      {
        title: "Date",
        field: "date",
      },
      {
        title: "Mileage",
        field: "mileage",
      },
      {
        title: "Pace",
        field: "pace",
      },
      {
        title: "Duration",
        field: "duration",
      },
    ],
  });
  return <div id="history-table"></div>;
};

export default History;
