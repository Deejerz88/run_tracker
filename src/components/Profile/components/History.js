import { useEffect } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { DateTime, Duration } from "luxon";
import axios from "axios";
import { mean, sum } from "lodash";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const History = ({ setState, Context, setContext, races }) => {
  const { participant } = Context;

  const navigate = useNavigate();

  useEffect(() => {
    const getHistory = async (table) => {
      if (!participant) return;

      const { user_id } = participant;
      const { data } = await axios.get(`/participant/${user_id}`);
      const { races } = data;
      if (!data.user_id || !races?.length) return;

      const history = [];

      races?.forEach((race) => {
        const { attendance, id: raceId } = race;
        if (!attendance) return;

        attendance.forEach((a) => {
          let {
            id: attendanceId,
            date,
            mileage,
            pace,
            duration,
            start,
            finish,
          } = a;
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
            raceId,
            attendanceId,
            race: race.name,
            date,
            mileage,
            pace,
            duration,
            start,
            finish,
          });
        });
      });
      table.setData(history);
    };
    const table = new Tabulator("#history-table", {
      layout: "fitColumns",
      placeholder: "No Events... yet!",
      height: "100%",
      groupBy: (data) => data.race,
      groupHeader: (value, count, data, group) => {
        return value + " (" + count + " attended)";
      },
      columnCalcs: "group",
      columnDefaults: {},
      columns: [
        {
          title: "Race ID",
          field: "raceId",
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
            const total = sum(values);
            const avg = mean(values);
            return `${total.toFixed(1)}<br/>${avg?.toFixed(1) || null}`;
          },
          bottomCalcFormatter: "html",
          // editable: true,
          // editor: "number",
        },
        {
          title: "Pace",
          field: "pace",
          bottomCalc: (values) => {
            let numValues = 0;
            const total = values.reduce((acc, val) => {
              const [minutes, seconds] = val.split(":");

              const duration = Duration.fromObject({ minutes, seconds }).as(
                "seconds"
              );

              if (duration === 0) {
                return acc;
              } else {
                numValues++;
                return acc + duration;
              }
            }, 0);
            const avg = total / numValues || 0;

            const totalDuration = Duration.fromObject({
              seconds: total,
            }).toFormat("m:ss");

            const avgDuration = Duration.fromObject({ seconds: avg }).toFormat(
              "m:ss"
            );

            return `${totalDuration}<br/>${avgDuration}`;
          },
          bottomCalcFormatter: "html",
        },
        {
          title: "Duration",
          field: "duration",
          bottomCalc: (values) => {
            let numValues = 0;
            const total = values.reduce((acc, val) => {
              const [hours, minutes, seconds] = val.split(":");

              const duration = Duration.fromObject({
                hours,
                minutes,
                seconds,
              }).as("seconds");

              if (duration === 0) {
                return acc;
              } else {
                numValues++;
                return acc + duration;
              }
            }, 0);
            console.log("total", total, "numValues", numValues);
            const avg = total / numValues || 0;

            const totalDuration = Duration.fromObject({
              seconds: total,
            }).toFormat("h:mm:ss");

            const avgDuration = Duration.fromObject({
              seconds: avg,
            }).toFormat("h:mm:ss");

            return `${totalDuration}<br/>${avgDuration}`;
          },
          bottomCalcFormatter: "html",
        },
      ],
    });
    table.on("tableBuilt", () => {
      getHistory(table);
    });
    table.on("rowClick", (e, row) => {
      let { raceId, date, mileage, pace, duration, start, finish } =
        row.getData();
      console.log("row Data", row.getData());
      console.log(DateTime.fromMillis(start).toFormat("h:mm:ss"));

      date = DateTime.fromFormat(date, "MM/dd/yyyy").toISODate();

      const [paceMinutes, paceSeconds] = pace.split(":");

      pace = Duration.fromObject({
        minutes: paceMinutes,
        seconds: paceSeconds,
      }).toObject();

      const [durationHours, durationMinutes, durationSeconds] =
        duration.split(":");

      duration = Duration.fromObject({
        hours: durationHours,
        minutes: durationMinutes,
        seconds: durationSeconds,
      }).toObject();

      const { user_id } = participant;
      navigate(`/profile/${user_id}/checkin`);

      setState((state) => ({
        ...state,
        mileage,
        pace,
        duration,
        start,
        finish,
      }));

      const race = races.find((r) => r.id === raceId);

      setContext((prev) => ({ ...prev, race, date }));
      toast.success("Updating Event", {
        autoClose: 1000,
        position: "top-center",
      });
    });
    // table.on("rowContext", async (e, row) => {
    //   e.preventDefault();
    //   let { date, raceId } = row.getData();
    //   date = DateTime.fromFormat(date, "MM/dd/yyyy").toISODate();

    //   const { user_id } = participant;
    //   const res = await axios.delete(
    //     `/participant/attendance/${user_id}/${raceId}/${date}`
    //   );
    //   console.log(res);
    //   if (res.status === 200) {
    //     table.deleteRow(row);
    //   }
    // });
  }, [navigate, participant, races, setContext, setState]);

  return (<div id="history-table"></div>);
};

export default History;
