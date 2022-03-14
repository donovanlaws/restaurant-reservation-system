const service = require("./reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperty = require("../errors/hasProperty");

// MAIN CONTROLLER FUNCTIONS FOR THIS ROUTER //
// Return all of the reservations, based off of query input.
async function list(req, res, next) {
  res.json({ data: res.locals.reservations });
}

// Create a new reservation, based off of the request.
async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Read a reservation, based on if it exists and was stored.
async function read(req, res, next) {
  res.json({ data: res.locals.reservation })
}

// Update a reservation, based on if it exists and was stored.
async function update(req, res, next) {
  const { reservation_id } = res.locals.reservation;
  const updatedRes = { ...req.body.data, reservation_id };
  const data = await service.update(updatedRes);
  res.json({ data: data[0] })
}

// Update a reservation's status, based on if it exists and the status property passed checks.
async function updateStatus(req, res, next) {
  const { reservation_id } = req.params;
  const updatedRes = { ...req.body.data, reservation_id }
  const data = await service.updateStatus(updatedRes);
  res.json({ data: data[0] });
}



// MIDDLEWARE VALIDATION FUNCTIONS FOR THIS ROUTER //
async function resExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundRes = await service.read(reservation_id);
  if (foundRes) {
    res.locals.reservation = foundRes;
    return next();
  }
  else next({ status: 404, message: `Reservation ${reservation_id} does not exist.` })
}

// If the query includes a date, list reservations for that date or list nothing.
async function queryInput(req, res, next) {
  const { date, mobile_number } = req.query;
  if (date) {
    res.locals.reservations = await service.list(date);
    next();
  } else if (mobile_number) {
    res.locals.reservations = await service.search(mobile_number);
    next();
  }
  else next({status: 400, message:`No query was specified in the URL`})
}

// Checks that the reservation's date and time are not an invalid date or time.
const dateTimeValid = (req, res, next) => {
  const { data: { reservation_date, reservation_time } = {} } = req.body;
  const reservation = new Date(`${reservation_date}T${reservation_time}Z`);
  const now = new Date();
  const [hour, minute] = reservation_time.split(":");
  if (reservation_date === "not-a-date") next({ status: 400, message: `reservation_date not a valid date.` });
  else if (reservation_time === "not-a-time") next({ status: 400, message: `reservation_time not a valid time.` })
  else if (reservation.getUTCDay() === 2) next({ status: 400, message: `Your reservation cannot be on a Tuesday (closed).` })
  else if (reservation < now) next({ status: 400, message: `Your reservation must be in the future.` })
  else if (hour < 10 || hour > 21 || (hour == 10 && minute < 30) || (hour == 21 && minute > 30)) next({ status: 400, message: `Your reservation time must be between 10:30 AM and 9:30 PM` })
  else next();
}

// Checks that the people key is a number greater than 0
const validPeople = (req, res, next) => {
  const { data: { people } = {} } = req.body;
  if (people <= 0 || typeof (people) !== "number") next({ status: 400, message: `The people property is invalid.` });
  else next();
}

// Checks that if the reservation is finished, it cannot be updated
const isResFinished = (req, res, next) => {
  if (res.locals.reservation.status !== "finished") next();
  else next({ status: 400, message: "Reservation cannot be finished!" })
}

// Checks that a new reservation only has a status of booked.
const resOnlyBooked = (req, res, next) => {
  const { status } = req.body.data;
  if (!status || status === "booked") next();
  else next({ status: 400, message: `New reservations cannot be '${status}', only 'booked'.` })
}

// Checks that if the status value is invalid, it cannot be updated
const badStatus = (req, res, next) => {
  const statuses = ["seated", "booked", "finished", "cancelled"];
  const { status } = req.body.data;
  if (statuses.includes(status)) next();
  else next({ status: 400, message: `The status cannot be ${status}, and must be "seated", "booked", "finished", or "cancelled".` })
}

module.exports = {
  list: [
    asyncErrorBoundary(queryInput),
    asyncErrorBoundary(list)
  ],
  create: [
    hasProperty("first_name"),
    hasProperty("last_name"),
    hasProperty("mobile_number"),
    hasProperty("reservation_date"),
    hasProperty("reservation_time"),
    hasProperty("people"),
    dateTimeValid,
    validPeople,
    resOnlyBooked,
    asyncErrorBoundary(create)
  ],
  read: [
    asyncErrorBoundary(resExists),
    asyncErrorBoundary(read)
  ],
  update: [
    hasProperty("first_name"),
    hasProperty("last_name"),
    hasProperty("mobile_number"),
    hasProperty("reservation_date"),
    hasProperty("reservation_time"),
    hasProperty("people"),
    dateTimeValid,
    validPeople,
    asyncErrorBoundary(resExists),
    asyncErrorBoundary(update)
  ],
  updateStatus: [
    asyncErrorBoundary(resExists),
    badStatus,
    isResFinished,
    asyncErrorBoundary(updateStatus)
  ]
};
