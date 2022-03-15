import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listReservations, listTables, finishTable } from "../utils/api";
import { previous, next, today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import ReservationList from "../reservations/ReservationList";
import TableList from "../tables/TableList";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
export default function Dashboard({ date }) {
  // Initialize states for reservations and errors
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [dashboardError, setDashboardError] = useState([]);

  // Set the date to a specified date, if specified in the URL. Otherwise it will be the current day.
  const dateFound = useQuery().get("date");
  if (dateFound) date = dateFound;

  useEffect(() => {
    const abortController = new AbortController();
    async function loadDashboard() {
      // Load and list the reservations for today's date, or a specified date
      setDashboardError([]);
      listReservations({ date }, abortController.signal)
        .then((response) => {
          setReservations(response);
          if (response.length === 0) setDashboardError([`There are no reservations on ${date}`]);
        })
        .catch((err) => {
          setReservations([]);
          setDashboardError([err.message]);
        });

      // Load and list the tables from the API
      listTables(abortController.signal)
        .then((res) =>
          setTables(res.sort((tableA, tableB) => tableA.table_name - tableB.table_name))
        )
        .catch((err) => {
          setTables([]);
          setDashboardError([err.message]);
        });
    }

    loadDashboard();
    return () => abortController.abort();
  }, [date]);

  // Handler function for when "Finish" is clicked.
  async function finishThisTable(table_id) {
    const approved = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (approved) {
      const abortController = new AbortController();
      await finishTable(table_id, abortController.signal);
      await listTables(abortController.signal).then((res) => setTables(res));
      await listReservations({ date }, abortController.signal).then((res) =>
        setReservations(res)
      );
    }
  }
  
  // JSX, Page Contents
  return (
    <main>
      <h1 className="d-md-flex justify-content-center">Dashboard</h1>
      <div className="d-md-flex mb-3 justify-content-center">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>

      <div className="d-flex justify-content-center my-3">
        <Link to={`/dashboard?date=${previous(date)}`}>
          <button className="btn btn-dark" type="button"><span className="oi oi-arrow-thick-left" />&nbsp;Previous Day</button>
        </Link>
        <Link to={`/dashboard?date=${today()}`}>
          <button className="btn btn-info mx-3" type="button" disabled={date === today() ? true : false}>Today</button>
        </Link>
        <Link to={`/dashboard?date=${next(date)}`}>
          <button className="btn btn-dark" type="button">Next Day&nbsp;<span className="oi oi-arrow-thick-right" /></button>
        </Link>
      </div>

      <TableList tables={tables} finishThisTable={finishThisTable} />
      <ReservationList reservations={reservations} setReservations={setReservations} />
      <ErrorAlert error={dashboardError} />
    </main>
  );
}