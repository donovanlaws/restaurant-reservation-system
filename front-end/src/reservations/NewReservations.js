import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { today } from "../utils/date-time";
import { createReservation } from "../utils/api";

export default function NewReservation() {
  // Initialize the form, formData state, and error state.
  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: today(),
    reservation_time: "10:30",
    people: 0,
    status: "booked",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState([]);

  // Once submitted, create the reservation and return to the dashboard on that reservation's date. Otherwise show an error.
  async function submitAction() {
    const abortController = new AbortController();
    await createReservation(formData, abortController.signal);
  }

  // JSX, Page Contents
  return (
    <main>
      <h2>New Reservation</h2>
      <ReservationForm formData={formData} submitAction={submitAction} setFormData={setFormData} setError={setError} />
      <ErrorAlert error={error} />
    </main>
  );
}