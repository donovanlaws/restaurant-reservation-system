import React from "react";
import { Link } from "react-router-dom";

export default function ReservationList({ reservations }) {
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
                    <td data-reservation-id-status={res.reservation_id}>{res.status}</td>
                    <td>{res.status === "booked" && <Link className="btn btn-primary" to={`/reservations/${res.reservation_id}/seat`}>Seat</Link>}</td>
                </tr>
            )
        })
    }

    return (
        <table className="table">
            <thead className="thead-dark">
                <tr>
                    <th className="col-1">ID</th>
                    <th className="col-2">First Name</th>
                    <th className="col-2">Last Name</th>
                    <th className="col-2">Number</th>
                    <th className="col-1">People</th>
                    <th className="col-1">Time</th>
                    <th className="col-1">Status</th>
                    <th className="col-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {reservationsList}
            </tbody>
        </table>
    )
}