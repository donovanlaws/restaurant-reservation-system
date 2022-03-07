import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { today } from "../utils/date-time";
import { createReservation } from "../utils/api";
import { useHistory } from "react-router-dom";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function NewReservation() {
    // Initialize the form, formData state, and error state.
    const initialFormState = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: today(),
        reservation_time: "10:30",
        people: 0,
        status: "booked"
    }
    const [formData, setFormData] = useState(initialFormState);
    const [error, SetError] = useState([]);
    const history = useHistory();

    // Since the reservation date defaults to "today", if today is a Tuesday, show an error accordingly.
    useEffect(() => {
        const reservation = new Date(`${formData.reservation_date}`);
        if (reservation.getUTCDay() === 2) SetError(["The restaurant is closed on Tuesdays!"])
    }, [])

    // Every time information is changed, update and check for errors or inconsistencies.
    const handleChange = (event) => {
        if (event.target.name === "people") setFormData({ ...formData, [event.target.name]: Number(event.target.value)})
        else setFormData({ ...formData, [event.target.name]: event.target.value})
    }

    // Once submitted, create the reservation and return to the dashboard on that reservation's date. Otherwise show an error.
    async function handleSubmit(event) {
        event.preventDefault();
        const errors = [];

        // Handle Validation of Date
        const reservation = new Date(`${formData.reservation_date}T${formData.reservation_time}Z`);
        const now = new Date();
        if (reservation.getUTCDay() === 2 && reservation < now) errors.push("The restaurant is closed on Tuesdays!", "Your reservation cannot be in the past!");
        else if (reservation.getUTCDay() === 2) errors.push("The restaurant is closed on Tuesdays!");
        else if (reservation < now) errors.push("Your reservation cannot be in the past!");

        // Handle Validation of Time
        const splitTime = formData.reservation_time.split(":");
        const hour = splitTime[0];
        const minute = splitTime[1];
        if (hour < 10 || hour > 21 || (hour == 10 && minute < 30) || (hour == 21 && minute > 30)) errors.push("Your reservation time must be between 10:30 AM and 9:30 PM");

        if (!errors.length) {
            try {
                await createReservation(formData);
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

export default NewReservation;