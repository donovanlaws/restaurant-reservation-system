const service = require("./reservations.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperty = require("../errors/hasProperty");

// MAIN CONTROLLER FUNCTIONS FOR THIS ROUTER //
async function list(req, res, next) {
  res.json({ data: res.locals.reservations });
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function read(req, res, next) {
  res.json({ data: res.locals.oneReservation })
}

async function update(req, res, next) {
  const data = service.update(req.body.data);
}

async function updateStatus(req, res, next) {
  res.locals.reservation.status = req.body.data.status;
  const data = await service.updateStatus(res.locals.reservation);
  res.status(200).json({ data });
}


// MIDDLEWARE VALIDATION FUNCTIONS FOR THIS ROUTER //
async function resExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundRes = await service.read(reservation_id);
  if (foundRes) {
    res.locals.oneReservation = foundRes;
    return next();
  }
  else next({ status: 404, message: `Reservation ${reservation_id} does not exist.` })
}

// If the query includes a date, list reservations for that date or list nothing.
async function queryInput(req, res, next) {
  const { date } = req.query;
  if (date) {
    const reservations = await service.list(date);
    if (reservations.length) {
      res.locals.reservations = reservations;
      next();
    } else {
      res.locals.reservations = [];
      next();
    }
  }
}

// Checks that the reservation's date and time are not an invalid date or time.
const dateTimeValid = (req, res, next) => {
  const { data: { reservation_date, reservation_time } = {} } = req.body;
  const reservation = new Date(`${reservation_date}T${reservation_time}Z`);
  const now = new Date();
  const splitTime = reservation_time.split(":");
  const hour = splitTime[0];
  const minute = splitTime[1];
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

async function checkResStatus(req, res, next) {
  if (res.locals.reservation.status !== "finished") next();
  else next({ status: 400, message: "Reservation cannot be finished!" })
}

async function badStatus(req, res, next) {
  const statuses = ["seated", "booked", "finished", "cancelled"];
  if (statuses.includes(req.body.data.status)) next();
  else next({ status: 400, message: `The status must be one of "seated", "booked", "finished", or "cancelled"` })
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
    asyncErrorBoundary(dateTimeValid),
    asyncErrorBoundary(validPeople),
    asyncErrorBoundary(create)
  ],
  read: [
    asyncErrorBoundary(resExists), 
    asyncErrorBoundary(read)
  ],
  update: [
    asyncErrorBoundary(resExists),
    asyncErrorBoundary(update)
  ],
  updateStatus: [
    asyncErrorBoundary(resExists),
    asyncErrorBoundary(checkResStatus),
    asyncErrorBoundary(badStatus),
    asyncErrorBoundary(updateStatus)
  ]
};
