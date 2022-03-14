exports.up = function (knex) {
  // Connect with knex and set up a table "Tables"
  return knex.schema.createTable("tables", (table) => {
    table.increments("table_id").primary();
    table.string("table_name");
    table.integer("capacity");
    table.string("status").defaultTo("free");
    table
      .integer("reservation_id")
      .references("reservation_id")
      .inTable("reservations")
      .onDelete("set null");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tables");
};