import React, { useState, useEffect } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { readReservation, updateReservation } from "../utils/api";
import { useParams } from "react-router";

export default function EditReservation() {
  // Initialize formData and errors
  const { reservation_id } = useParams();
  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "10:30",
    people: 0,
    status: "booked",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState([]);

  // Load the reservation from the API
  useEffect(() => {
    async function loadReservation() {
      if (reservation_id) {
        const abortController = new AbortController();
        setError([]);
        readReservation(reservation_id, abortController.signal)
          .then((result) => {
            let formattedDate = result.reservation_date.slice(0, 10);
            setFormData({ ...result, reservation_date: formattedDate });
          })
          .catch((err) => {
            setError([err.message]);
          });
      }
    }

    loadReservation();
  }, []);

  // Once submitted, update the reservation and return to the dashboard on that reservation's date. Otherwise show an error.
  async function submitAction() {
    await updateReservation(formData);
  }

  // JSX, Page Contents
  return (
    <main>
      <h1>Edit Reservation</h1>
      <ReservationForm formData={formData} submitAction={submitAction} setFormData={setFormData} setError={setError} />
      <ErrorAlert error={error} />
    </main>
  );
}