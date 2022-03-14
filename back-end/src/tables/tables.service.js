const knex = require("../db/connection");

function list() {
  return knex("tables")
    .select("*")
    .orderBy("table_name");
}

function read(table_id) {
  return knex("tables")
    .where({ table_id })
    .first();
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((newTab) => newTab[0]);
}

function update(table) {
  return knex("tables")
    .update(table, "*")
    .where({ table_id: table.table_id });
}

module.exports = {
  list,
  read,
  create,
  update,
};