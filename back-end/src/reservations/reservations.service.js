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
        .whereNot({ status: "finished" })
        .orderBy("reservation_time")
}

function search(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
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
        .update({ status: reservation.status }, "*")
}

module.exports = {
    create,
    list,
    read,
    update,
    updateStatus,
    search
}