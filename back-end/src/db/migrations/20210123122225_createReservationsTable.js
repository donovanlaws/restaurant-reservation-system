exports.up = function (knex) {
  // Connect with knex and set up a table "Reservations"
  return knex.schema.createTable("reservations", (table) => {
    table.increments("reservation_id").primary();
    table.string("first_name");
    table.string("last_name");
    table.string("mobile_number");
    table.string("status").defaultTo("booked");
    table.date("reservation_date");
    table.time("reservation_time");
    table.integer("people");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reservations");
};