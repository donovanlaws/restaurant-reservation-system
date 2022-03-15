import React from "react";

export default function TableList({ tables, finishThisTable }) {
  const onClick = (event, table_id) => {
    event.preventDefault();
    finishThisTable(table_id);
  };

  // Map out the tables into a table list with information
  let tablesList = [];
  if (tables.length > 0) {
    tablesList = tables.map((table, index) => {
      if (table.status !== "finished") {
        return (
          <tr key={index}>
            <th scope="row">{table.table_id}</th>
            <td>{table.table_name}</td>
            <td>{table.capacity}</td>
            <td data-table-id-status={table.table_id}>{table.status}</td>
            <td>{table.reservation_id}</td>
            <td>
              {table.status === "occupied" && (
                <button className="btn btn-primary py-1" data-table-id-finish={table.table_id} onClick={(event) => onClick(event, table.table_id)}>Finish</button>
              )}
            </td>
          </tr>
        );
      }
    });
  }

  // JSX, Page Contents
  return (
    <table className="table table-striped">
      <thead className="table-head">
        <tr>
          <th className="col-1">ID</th>
          <th className="col-3">Table Name</th>
          <th className="col-2">Capacity</th>
          <th className="col-1">Status</th>
          <th className="col-2">Reservation ID</th>
          <th className="col-2">Actions</th>
        </tr>
      </thead>
      <tbody>{tablesList}</tbody>
    </table>
  );
}