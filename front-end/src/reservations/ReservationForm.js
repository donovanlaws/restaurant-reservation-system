import React from "react";
import { useHistory } from "react-router-dom";

export default function ReservationForm({ formData, submitAction, setFormData, setError }) {
  let history = useHistory();

  // Every time information is changed, update and check for errors or inconsistencies.
  const handleChange = (event) => {
    if (event.target.name === "people") setFormData({...formData, [event.target.name]: Number(event.target.value)});
    else setFormData({ ...formData, [event.target.name]: event.target.value });
  };

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
        await submitAction();
        history.push(`/dashboard?date=${formData.reservation_date}`);
      } catch (err) {
        errors.push(err.message);
        setError(errors);
      }
    } else setError(errors);
  }

  // JSX, Form Contents
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="first_name">First Name</label>
        <input
          required
          name="first_name"
          type="text"
          className="form-control"
          value={formData.first_name}
          placeholder="First Name"
          onChange={handleChange}
        />
        <label htmlFor="last_name">First Name</label>
        <input
          required
          name="last_name"
          type="text"
          className="form-control"
          value={formData.last_name}
          placeholder="Last Name"
          onChange={handleChange}
        />
        <label htmlFor="mobile_number">Mobile Phone</label>
        <input
          required
          name="mobile_number"
          type="text"
          className="form-control"
          value={formData.mobile_number}
          placeholder="555-555-5555"
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="reservation_date">Date</label>
        <input
          required
          name="reservation_date"
          type="date"
          className="form-control"
          value={formData.reservation_date}
          onChange={handleChange}
        />
        <label htmlFor="reservation_time">Time</label>
        <input
          required
          name="reservation_time"
          type="time"
          className="form-control"
          value={formData.reservation_time}
          onChange={handleChange}
        />
        <label htmlFor="people">Number of People:</label>
        <input
          required
          name="people"
          type="number"
          className="form-control"
          value={formData.people}
          onChange={handleChange}
          min="1"
        />
      </div>
      <button type="submit" className="btn btn-primary mr-2"><span className="oi oi-check"></span> Submit</button>
      <button className="btn btn-secondary" type="button" onClick={() => history.goBack()}><span className="oi oi-x"></span> Cancel</button>
    </form>
  );
}