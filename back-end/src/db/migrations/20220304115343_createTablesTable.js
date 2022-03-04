exports.up = function (knex) {
    // Connect to Knex and create a new table with the columns needed.
    return knex.schema.createTable("tables", (table) => {
        table.increments("table_id").primary();
        table.string("table_name");
        table.integer("capacity");
        table.string("status");
        table.integer("reservation_id").references("reservation_id").inTable("reservations").onDelete("set null");
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("tables");
};
