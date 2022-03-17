import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationList from "../reservations/ReservationList";
import { searchReservations } from "../utils/api";

export default function SearchDash() {
  // Initialize states for reservations and errors
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState([]);
  const [input, setInput] = useState("");

  // Async function to handle requests tot he API
  async function searchByNumber() {
    setError([]);
    const abortController = new AbortController();
    searchReservations(input, abortController.signal)
      .then((response) => {
        setReservations(response);
        if (response.length === 0) setError([`No reservations found.`]);
      })
      .catch((err) => {
        setReservations([]);
        setError([err.message]);
      });
    return () => abortController.abort();
  }

  // Change the input state when the input is changed
  const handleChange = (event) => {
    setInput(event.target.value);
  };

  // Run the async request when the form is submitted
  const handleSubmit = (event) => {
    event.preventDefault();
    searchByNumber();
  };

  return (
    <main>
      <h2>Search Reservations</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mobile_number">Mobile Number</label>
        <div className="form-group d-md-flex mb-3">
          <input
            required
            name="mobile_number"
            type="text"
            className="form-control col-6 mr-2"
            value={input}
            placeholder="Enter a reservation's phone number"
            onChange={handleChange}
          />
          <button type="submit" className="btn btn-primary"><span className="oi oi-magnifying-glass"></span> Find</button>
        </div>
      </form>
      <ReservationList reservations={reservations} />
      <ErrorAlert error={error} />
    </main>
  );
}