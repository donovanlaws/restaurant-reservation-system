const knex = require("../db/connection");

function create(reservation) {
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then((newRes) => newRes[0])
}

function list(date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .orderBy("reservation_time")
}

function read(reservation_id) {
    return knex("reservations")
        .where({ reservation_id })
        .first();
}

function update(reservation) {
    return knex("reservations")
        .where({ reservation_id: reservation.reservation_id })
        .update(reservation, "*")
}

function updateStatus(reservation) {
    return knex("reservations")
        .where({ reservation_id: reservation.reservation_id })
        .update(reservation);
}

module.exports = {
    create,
    list,
    read,
    update,
    updateStatus
}