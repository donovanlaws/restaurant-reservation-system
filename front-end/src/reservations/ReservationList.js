import React from "react";
import { Link } from "react-router-dom";
import { updateReservationStatus } from "../utils/api";
import { useHistory } from "react-router";

export default function ReservationList({ reservations }) {
  const history = useHistory();
  async function handleDelete(reservation_id) {
    const approved = window.confirm("Do you want to cancel this reservation? This cannot be undone.");
    if (approved) {
      const abortController = new AbortController();
      updateReservationStatus("cancelled", reservation_id, abortController.signal).then(() => history.push("/"));
    }
  }

  // Map out the reservations into a table list with information
  let reservationsList = [];
  if (reservations.length > 0) {
    reservationsList = reservations.map((res, index) => {
      return (
        <tr key={res.reservation_id}>
          <th scope="row">{res.reservation_id}</th>
          <td>{res.first_name}</td>
          <td>{res.last_name}</td>
          <td>{res.mobile_number}</td>
          <td>{res.people}</td>
          <td>{res.reservation_time}</td>
          <td data-reservation-id-status={res.reservation_id}>{res.status}</td>
          <td>
            {res.status === "booked" && (
              <>
                <Link className="btn btn-success mx-1 py-1 my-1" to={`/reservations/${res.reservation_id}/seat`}>Seat</Link>
                <Link className="btn btn-primary mx-1 py-1 my-1" to={`/reservations/${res.reservation_id}/edit`}>Edit</Link>
              </>
            )}
            {res.status !== "cancelled" && res.status !== "finished" && (
              <button className="btn btn-danger mx-1 py-1 my-1" type="button" data-reservation-id-cancel={res.reservation_id} onClick={() => handleDelete(res.reservation_id)}>Cancel</button>
            )}
          </td>
        </tr>
      );
    });
  }

  // JSX, Page Contents
  return (
    <table className="table table-striped">
      <thead className="table-head">
        <tr>
          <th className="col-1">ID</th>
          <th className="col-1">First Name</th>
          <th className="col-1">Last Name</th>
          <th className="col-2">Number</th>
          <th className="col-1">People</th>
          <th className="col-1">Time</th>
          <th className="col-1">Status</th>
          <th className="col-3">Actions</th>
        </tr>
      </thead>
      <tbody>{reservationsList}</tbody>
    </table>
  );
}