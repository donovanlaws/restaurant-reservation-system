import React, { useState, useEffect } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { today } from "../utils/date-time";
import { createReservation, readReservation, updateReservation } from "../utils/api";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";

export default function EditReservation() {
    const { reservation_id } = useParams();
    const initialFormState = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "10:30",
        people: 0,
        status: "booked"
    }
    const [formData, setFormData] = useState(initialFormState);
    const [error, SetError] = useState([]);
    const history = useHistory();

    // Load reservation
    useEffect(() => {
        async function loadReservation() {
            if (reservation_id) {
                const abortController = new AbortController();
                SetError([]);
                readReservation(reservation_id, abortController.signal)
                    .then((result) => {
                        const formattedDate = result.reservation_date.slice(0, 10);
                        setFormData({...result, reservation_date: formattedDate})
                    })
                    .catch((err) => {
                        SetError([err.message]);
                    })
            }
        }

        loadReservation();
    }, [])

    // Every time information is changed, update and check for errors or inconsistencies.
    const handleChange = (event) => {
        if (event.target.name === "people") setFormData({ ...formData, [event.target.name]: Number(event.target.value)})
        else setFormData({ ...formData, [event.target.name]: event.target.value})
    }

    // Once submitted, update the reservation and return to the dashboard on that reservation's date. Otherwise show an error.
    async function handleSubmit(event) {
        event.preventDefault();
        const errors = [];

        // Handle Validation of Date
        const reservation = new Date(`${formData.reservation_date}T${formData.reservation_time}Z`);
        const now = new Date();
        if (reservation.getUTCDay() === 2) errors.push("The restaurant is closed on Tuesdays!");
        if (reservation < now) errors.push("Your reservation cannot be in the past!");

        // Handle Validation of Time
        const splitTime = formData.reservation_time.split(":");
        const hour = splitTime[0];
        const minute = splitTime[1];
        if (hour < 10 || hour > 21 || (hour == 10 && minute < 30) || (hour == 21 && minute > 30)) errors.push("Your reservation time must be between 10:30 AM and 9:30 PM");

        if (!errors.length) {
            try {
                await updateReservation(formData);
                history.push(`/dashboard?date=${formData.reservation_date}`)
            } catch (err) {
                errors.push(err.message);
                SetError(errors);
            }
        } else SetError(errors);
    }

    return (
        <main>
            <h1>New Reservation</h1>
            <ReservationForm formData={formData} handleSubmit={handleSubmit} handleChange={handleChange} />
            <ErrorAlert error={error} />
        </main>
    );
}