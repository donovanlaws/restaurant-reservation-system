const reservations = require("./00-reservations.json");
exports.seed = function (knex) {
  // Clear the table's values, restart the ID, and insert data.
  return knex
    .raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(() => knex("reservations").insert(reservations));
};