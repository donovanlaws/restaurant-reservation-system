const tables = require("./01-tables.json");
exports.seed = function (knex) {
  // Clear the table's values, restart the ID, and insert data.
  return knex
    .raw("TRUNCATE TABLE tables RESTART IDENTITY CASCADE")
    .then(() => knex("tables").insert(tables));
};