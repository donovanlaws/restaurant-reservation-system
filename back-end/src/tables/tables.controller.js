const service = require("./tables.service.js");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperty = require("../errors/hasProperty");

// MAIN CONTROLLER FUNCTIONS FOR THIS ROUTER //
async function read(req, res, next) {
    res.json({ data: res.locals.table })
}

async function list(req, res, next) {
    const response = await service.list();
    res.json({ data: response });
}

async function create(req, res, next) {
    const { reservation_id } = req.body.data;
    if (reservation_id) {
        const reservation = await reservationService.read(reservation_id);
        reservation.status = "seated";
        req.body.data.status = "occupied";
        const updatedRes = await reservationService.update(reservation, req.body.data);
    }
    const data = await service.create(req.body.data);
    res.status(201).json({ data });
}

async function update(req, res, next) {
    const { table, reservation } = res.locals;
    table.reservation_id = reservation.reservation_id;
    table.status = "occupied";
    reservation.status = "seated";

    const updatedTable = await service.update(table);
    const updatedRes = await reservationService.update(reservation, table);
    res.json({ data: [updatedTable, updatedRes] });
}

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


// MIDDLEWARE VALIDATION FUNCTIONS FOR THIS ROUTER //
async function tableExists(req, res, next) {
    const { table_id } = req.params;
    const foundTable = await service.read(table_id);
    if (foundTable) {
        res.locals.table = foundTable;
        return next();
    }
    else next({ status: 404, message: `Table ${table_id} does not exist.` })
}

async function resExists(req, res, next) {
    const { reservation_id } = req.body.data;
    const foundRes = await reservationService.read(reservation_id);
    if (foundRes) {
        res.locals.reservation = foundRes;
        next();
    } else next({ status: 404, message: `Reservation ${reservation_id} does not exist.` });
}

async function tableOneLetter(req, res, next) {
    const { table_name } = req.body.data;
    if (table_name.length <= 1) next({ status: 400, message: `table_name must be 2 characters or longer.` });
    else next();
}

async function capacityValid(req, res, next) {
    const { capacity } = req.body.data;
    if (capacity <= 0 || typeof (capacity) !== "number") next({ status: 400, message: `capacity must be a valid number bigger than 0` })
    else next();
}

async function isSeated(req, res, next) {
    if (res.locals.reservation.status !== "seated") next();
    else next({ status: 400, message: `Reservation is already seated!` });
}

async function tableOccupied(req, res, next) {
    if (!res.locals.table.reservation_id) next();
    else next({ status: 400, message: `Table is already occupied!` })
}

async function tableNotOccupied(req, res, next) {
    if (res.locals.table.reservation_id) next();
    else next({ status: 400, message: `Table is not occupied!`})
}

async function tableFitsCapacity(req, res, next) {
    const tableLimit = res.locals.table.capacity;
    const people = res.locals.reservation.people;
    if (people <= tableLimit) next();
    else next({ status: 400, message: `Table capacity cannot fit this party size!` })
}

module.exports = {
    read: [
        asyncErrorBoundary(tableExists), 
        asyncErrorBoundary(read)]
        ,
    list: [
        asyncErrorBoundary(list)
    ],
    create: [
        hasProperty("table_name"),
        hasProperty("capacity"),
        asyncErrorBoundary(capacityValid),
        asyncErrorBoundary(tableOneLetter),
        asyncErrorBoundary(create)
    ],
    update: [
        hasProperty("reservation_id"),
        asyncErrorBoundary(resExists),
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(isSeated),
        asyncErrorBoundary(tableOccupied),
        asyncErrorBoundary(tableFitsCapacity),
        asyncErrorBoundary(update)
    ],
    delete: [
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(tableNotOccupied),
        asyncErrorBoundary(finishTable)
    ]
};
