const service = require("./tables.service.js");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperty = require("../errors/hasProperty");

//======== MAIN CONTROLLER FUNCTIONS FOR THIS ROUTER ========//
// List all of the tables from API
async function list(req, res, next) {
  const response = await service.list();
  res.json({ data: response });
}

// Print the stored table
async function read(req, res, next) {
  res.json({ data: res.locals.table });
}

// Create a new table from the request body
async function create(req, res, next) {
  const { reservation_id } = req.body.data;
  // If a table is created with a reservation ID referenced, read and update that reservation.
  if (reservation_id) {
    const reservation = await reservationService.read(reservation_id);
    reservation.status = "seated";
    req.body.data.status = "occupied";
    await reservationService.update(reservation, req.body.data);
  }
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Update a table using what was stored
async function update(req, res, next) {
  const { table, reservation } = res.locals;
  table.reservation_id = reservation.reservation_id;
  table.status = "occupied";
  reservation.status = "seated";

  const updatedTable = await service.update(table);
  const updatedRes = await reservationService.update(reservation, table);
  res.json({ data: [updatedTable, updatedRes] });
}

// Update the stored table to be freed, find the reservation and update it to be finished.
async function finishTable(req, res, next) {
  const { table } = res.locals;
  const reservation = await reservationService.read(table.reservation_id);
  table.reservation_id = null;
  table.status = "free";
  reservation.status = "finished";

  const updatedTable = await service.update(table);
  const updatedRes = await reservationService.update(reservation, table);
  res.json({ data: [updatedTable, updatedRes] });
}

//======== MIDDLEWARE VALIDATION FUNCTIONS FOR THIS ROUTER ========//
// Find and verify that this table exists in the DB
async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const foundTable = await service.read(table_id);
  if (foundTable) {
    res.locals.table = foundTable;
    return next();
  } else next({ status: 404, message: `Table ${table_id} does not exist.` });
}

// Find and verify that a referenced reservation exists in the DB
async function resExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const foundRes = await reservationService.read(reservation_id);
  if (foundRes) {
    res.locals.reservation = foundRes;
    next();
  } else next({status: 404, message: `Reservation ${reservation_id} does not exist.`});
}

// Verify that the table's name is longer than 1 character
async function tableOneLetter(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length <= 1) next({status: 400, message: `table_name must be 2 characters or longer.`});
  else next();
}

// Verify that the table's capacity is a valid number greater than 0
async function capacityValid(req, res, next) {
  const { capacity } = req.body.data;
  if (capacity <= 0 || typeof capacity !== "number") next({status: 400, message: `capacity must be a valid number bigger than 0`});
  else next();
}

// Throw an error if the referenced reservation is already seated
async function isSeated(req, res, next) {
  if (res.locals.reservation.status !== "seated") next();
  else next({ status: 400, message: `Reservation is already seated!` });
}

// Throw an error if the table is already occupied
async function tableOccupied(req, res, next) {
  if (!res.locals.table.reservation_id) next();
  else next({ status: 400, message: `Table is already occupied!` });
}

// Throw an error if the table is not occupied
async function tableNotOccupied(req, res, next) {
  if (res.locals.table.reservation_id) next();
  else next({ status: 400, message: `Table is not occupied!` });
}

// Throw an error if the reservation party size exceeds the table capacity
async function tableFitsCapacity(req, res, next) {
  const tableLimit = res.locals.table.capacity;
  const people = res.locals.reservation.people;
  if (people <= tableLimit) next();
  else next({status: 400, message: `Table capacity cannot fit this party size!`});
}

module.exports = {
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  list: [asyncErrorBoundary(list)],
  create: [
    hasProperty("table_name"),
    hasProperty("capacity"),
    asyncErrorBoundary(capacityValid),
    asyncErrorBoundary(tableOneLetter),
    asyncErrorBoundary(create),
  ],
  update: [
    hasProperty("reservation_id"),
    asyncErrorBoundary(resExists),
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(isSeated),
    asyncErrorBoundary(tableOccupied),
    asyncErrorBoundary(tableFitsCapacity),
    asyncErrorBoundary(update),
  ],
  delete: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(tableNotOccupied),
    asyncErrorBoundary(finishTable),
  ],
};