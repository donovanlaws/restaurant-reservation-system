import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { previous, next, today } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  // Initialize states for reservations and errors
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [dashboardError, setDashboardError] = useState([]);

  // If there's a query in the URL, the date is not today and needs to be changed.
  const query = new URLSearchParams(useLocation().search);
  const dateFound = query.get("date");
  if (dateFound) date = dateFound;

  // Every time the date changes, list reservations for that date.
  useEffect(() => {
    const abortController = new AbortController();
    async function loadDashboard() {
      setDashboardError([]);
      listReservations({ date }, abortController.signal)
        .then((response) => {
          setReservations(response);
          if (response.length === 0) setDashboardError([`There are no reservations on ${date}`])
        })
        .catch((err) => {
          setReservations([]);
          setDashboardError([err.message])
        });

      listTables(abortController.signal)
        .then((response) => {
          setTables(response.sort((table1, table2) => table1.table_name - table2.table_name));
        })
        .catch((err) => {
          setTables([]);
          setDashboardError([err.message])
        })
    }

    loadDashboard();
    return () => abortController.abort();
  }, [date]);

  async function finishThisTable(table_id) {
    const approved = window.confirm('Is this table ready to seat new guests? This cannot be undone.')
    if (approved) {
      finishTable(table_id)
        .then(() => listTables())
        .then((response) => setTables(response))
        .catch((err) => console.log(err))
    }
  }

  // Map out the reservations into a table list with information
  let reservationsList = [];
  if (reservations.length > 0) {
    reservationsList = reservations.map((res, index) => {
      return (
          <tr key={index}>
            <th scope="row">{res.reservation_id}</th>
            <td>{res.first_name}</td>
            <td>{res.last_name}</td>
            <td>{res.mobile_number}</td>
            <td>{res.people}</td>
            <td>{res.reservation_time}</td>
            <td>{res.status}</td>
            {res.status === "booked" && <td><Link className="btn btn-primary" to={`/reservations/${res.reservation_id}/seat`}>Seat</Link></td>}
          </tr>
        )
    })
  }

  // Map out the tables into a table list with information
  let tablesList = [];
  if (tables.length > 0) {
    tablesList = tables.map((table, index) => {
      return (
        <tr key={index}>
          <th scope="row">{table.table_id}</th>
          <td>{table.table_name}</td>
          <td>{table.capacity}</td>
          <td data-table-id-status={table.table_id}>{table.status}</td>
          <td>{table.reservation_id}</td>
          {table.status === "occupied" && 
            <td>
              <button className="btn btn-primary" data-table-id-finish={table.table_id} onClick={(event) => {
                event.preventDefault();
                finishThisTable(table.table_id);
              }}>Finish</button>
            </td>}
        </tr>
      )
    })
  }
  
  return (
    <main>
      <h1 className="d-md-flex justify-content-center">Dashboard</h1>
      <div className="d-md-flex mb-3 justify-content-center">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <div className="d-flex justify-content-center my-3">
        <Link to={`/dashboard?date=${previous(date)}`}><button className="btn btn-dark" type="button"><span className="oi oi-arrow-thick-left" />&nbsp;Previous Day</button></Link>
        <Link to={`/dashboard?date=${today()}`}> <button className="btn btn-dark mx-3" type="button">Today</button></Link>
        <Link to={`/dashboard?date=${next(date)}`}><button className="btn btn-dark" type="button">Next Day&nbsp;<span className="oi oi-arrow-thick-right" /></button></Link>
      </div>

      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Table Name</th>
            <th scope="col">Capacity</th>
            <th scope="col">Status</th>
            <th scope="col">Reservation ID</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tablesList}
        </tbody>
      </table>

      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Number</th>
            <th scope="col">People</th>
            <th scope="col">Time</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservationsList}
        </tbody>
      </table>

      <ErrorAlert error={dashboardError} />
    </main>
  );
}

export default Dashboard;
