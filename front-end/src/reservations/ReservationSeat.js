import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import { listTables, updateTable } from "../utils/api";

export default function ReservationSeat() {
  const history = useHistory();
  const { reservation_id } = useParams();
  const [seatError, setSeatError] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tables, setTables] = useState([]);

  // Fetch the tables from the API
  useEffect(() => {
    const abortController = new AbortController();
    async function loadTables() {
      setSeatError([]);
      listTables(abortController.signal)
        .then((response) => {
          setTables(response.sort((table1, table2) => table1.table_name - table2.table_name));
        })
        .catch((err) => {
          setTables([]);
          setSeatError([err.message]);
        });
    }

    loadTables();
    return () => abortController.abort();
  }, [reservation_id]);

  // When the selected table is changed, if the value is 0, null the selectedId as no table is selected
  const handleChange = (event) => {
    event.target.value > 0 ? setSelectedId(event.target.value) : setSelectedId(null);
  };

  // Attempt to update the table through the API
  async function handleSubmit(event) {
    event.preventDefault();
    const errors = [];

    if (!selectedId) errors.push("No table is selected!");
    if (!reservation_id) errors.push(`Reservations ${reservation_id} does not exist!`);

    if (!errors.length) {
      try {
        const abortController = new AbortController();
        await updateTable(selectedId, reservation_id, abortController.signal);
        history.push("/dashboard");
      } catch (err) {
        errors.push(err.message);
        setSeatError(errors);
      }
    } else setSeatError(errors);
  }

  // JSX, Page Contents
  return (
    <main>
      <ErrorAlert error={seatError} />
      <h2>Seating Reservation: {reservation_id}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="select_table" className="mt-2">
            Choose a table to seat reservation {reservation_id}
          </label>
          <select onChange={handleChange} className="form-control" id="select_table" name="table_id">
            <option key={0} value={0}>- Select A Table -</option>
            {tables.map((table, index) => {
              return (<option key={index} value={table.table_id}>{table.table_name} - {table.capacity}</option>);
            })}
          </select>
        </div>
        <div>
          <button className="btn btn-primary m-2" type="submit">Submit</button>
          <button onClick={() => history.goBack()} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </main>
  );
}