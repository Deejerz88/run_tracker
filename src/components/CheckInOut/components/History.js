import React, { useEffect, useState } from "react";
import { Row, Col, Card, Container } from "react-bootstrap";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { DateTime, Duration } from "luxon";
import axios from "axios";

const History = ({ participant }) => {
  useEffect(() => {
    const getHistory = async (table) => {
      if (!participant) return;
      console.log("participant", participant);
      const { user_id } = participant;
      const { data } = await axios.get(`/participant/${user_id}`);
      console.log("data", data);
      const { races } = data;
      if (!data.user_id || !races.length) return;
      const history = [];
      races.forEach((race) => {
        const { attendance, id } = race;
        console.log("attendance", attendance);
        if (!attendance) return;
        attendance.forEach((a) => {
          let { date, mileage, pace, duration } = a;
          date = DateTime.fromISO(date).toFormat("MM/dd/yyyy");
          pace = Duration.fromObject({
            minutes: pace.minutes,
            seconds: pace.seconds,
          }).toFormat("m:ss");
          duration = Duration.fromObject({
            hours: duration.hours,
            minutes: duration.minutes,
            seconds: duration.seconds,
          }).toFormat("h:mm:ss");

          history.push({
            id,
            race: race.name,
            date,
            mileage,
            pace,
            duration,
          });
        });
      });
      console.log("history", history);
      table.setData(history);
      table.redraw(true);
    };
    const table = new Tabulator("#history-table", {
      layout: "fitColumns",
      groupBy: (data) => data.race,
      groupHeader: (value, count, data, group) => {
        return value + " (" + count + " attended)";
      },
      columnCalcs: "group",
      columns: [
        {
          title: "ID",
          field: "id",
          visible: false,
        },
        {
          title: "Race",
          field: "race",
          visible: false,
        },
        {
          title: "Date",
          field: "date",
          bottomCalc: () => "Total:<br/>Average:",
          bottomCalcFormatter: "html",
        },
        {
          title: "Mileage",
          field: "mileage",
          bottomCalc: (values) => {
            const total = values.reduce((acc, val) => acc + val, 0);
            const avg = total / values.length;
            return `${total.toFixed(1)}<br/>${avg?.toFixed(1) || null}`;
          },
          bottomCalcFormatter: "html",
        },
        {
          title: "Pace",
          field: "pace",
          bottomCalc: (values) => {
            const total = values.reduce((acc, val) => {
              const [minutes, seconds] = val.split(":");
              return (
                acc + Duration.fromObject({ minutes, seconds }).as("seconds")
              );
            }, 0);
            const avg = total / values.length;
            const totalDuration = Duration.fromObject({
              seconds: total,
            }).toFormat("m:ss");
            const avgDuration = Duration.fromObject({ seconds: avg }).toFormat(
              "m:ss"
            );
            console.log(
              "totalDuration",
              totalDuration,
              "avgDuration",
              avgDuration
            );
            return `${totalDuration}<br/>${avgDuration}`;
          },
          bottomCalcFormatter: "html",
        },
        {
          title: "Duration",
          field: "duration",
          bottomCalc: (values) => {
            const total = values.reduce((acc, val) => {
              const [hours, minutes, seconds] = val.split(":");
              return (
                acc +
                Duration.fromObject({ hours, minutes, seconds }).as("seconds")
              );
            }, 0);
            const avg = total / values.length;
            const totalDuration = Duration.fromObject({
              seconds: total,
            }).toFormat("h:mm:ss");
            const avgDuration = Duration.fromObject({
              seconds: avg,
            }).toFormat("h:mm:ss");
            console.log(
              "totalDuration",
              totalDuration,
              "avgDuration",
              avgDuration
            );
            return `${totalDuration}<br/>${avgDuration}`;
          },
          bottomCalcFormatter: "html",
        },
      ],
    });
    table.on("tableBuilt", () => {
      getHistory(table);
    });
  }, []);

  return <div id="history-table"></div>;
};

export default History;
