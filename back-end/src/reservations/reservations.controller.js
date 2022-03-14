const service = require("./reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperty = require("../errors/hasProperty");

//======== MAIN CONTROLLER FUNCTIONS FOR THIS ROUTER ========//
// List all of the reservations stored
async function list(req, res, next) {
  res.json({ data: res.locals.reservations });
}

// Print the read and stored reservation
async function read(req, res, next) {
  res.json({ data: res.locals.reservation });
}

// Create a new reservation from the request body
async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Update a reservation using the request body and what was stored
async function update(req, res, next) {
  const { reservation_id } = res.locals.reservation;
  const updatedRes = { ...req.body.data, reservation_id };
  const data = await service.update(updatedRes);
  res.json({ data: data[0] });
}

// Update a reservation's status using the request body
async function updateStatus(req, res, next) {
  const { reservation_id } = req.params;
  const updatedRes = { ...req.body.data, reservation_id };
  const data = await service.updateStatus(updatedRes);
  res.json({ data: data[0] });
}

//======== MIDDLEWARE VALIDATION FUNCTIONS FOR THIS ROUTER ========//
// Find and verify that this reservation exists in the DB
async function resExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundRes = await service.read(reservation_id);
  if (foundRes) {
    res.locals.reservation = foundRes;
    return next();
  }
  else next({ status: 404, message: `Reservation ${reservation_id} does not exist.` });
}

// If there is a date, store reservations for that date. Otherwise if there is a number, store reservations with that number
async function queryInput(req, res, next) {
  const { date, mobile_number } = req.query;
  if (date) {
    res.locals.reservations = await service.list(date);
    next();
  } else if (mobile_number) {
    res.locals.reservations = await service.search(mobile_number);
    next();
  }
  else next({status: 400, message:`No query was specified in the URL`});
}

// Verify that the reservation's date and time are correct and not invalid (will be in UTC)
const dateTimeValid = (req, res, next) => {
  const { data: { reservation_date, reservation_time } = {} } = req.body;
  const reservation = new Date(`${reservation_date}T${reservation_time}Z`);
  const now = new Date();
  const [hour, minute] = reservation_time.split(":");
  if (reservation_date === "not-a-date") next({ status: 400, message: `reservation_date not a valid date.` });
  else if (reservation_time === "not-a-time") next({ status: 400, message: `reservation_time not a valid time.` });
  else if (reservation.getUTCDay() === 2) next({ status: 400, message: `Your reservation cannot be on a Tuesday (closed).` });
  else if (reservation < now) next({ status: 400, message: `Your reservation must be in the future.` });
  else if (hour < 10 || hour > 21 || (hour == 10 && minute < 30) || (hour == 21 && minute > 30)) next({ status: 400, message: `Your reservation time must be between 10:30 AM and 9:30 PM` });
  else next();
}

// Verify the people is a valid number > 0
const validPeople = (req, res, next) => {
  const { people } = req.body.data;
  if (people <= 0 || typeof (people) !== "number") next({ status: 400, message: `The people property is invalid.` });
  else next();
}

// Verify the status property is one of 4 valid strings
const badStatus = (req, res, next) => {
  const statuses = ["seated", "booked", "finished", "cancelled"];
  const { status } = req.body.data;
  if (statuses.includes(status)) next();
  else next({ status: 400, message: `The status cannot be ${status}, and must be "seated", "booked", "finished", or "cancelled".` })
}

// Throw an error if the reservation to be updated is already finished
const isResFinished = (req, res, next) => {
  if (res.locals.reservation.status !== "finished") next();
  else next({ status: 400, message: "Reservation cannot be finished!" })
}

// Throw an error if a new reservation does not start as "booked"
const resOnlyBooked = (req, res, next) => {
  const { status } = req.body.data;
  if (!status || status === "booked") next();
  else next({ status: 400, message: `New reservations cannot be '${status}', only 'booked'.` })
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