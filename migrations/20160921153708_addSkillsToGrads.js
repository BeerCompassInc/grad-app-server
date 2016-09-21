
exports.up = function (knex, Promise) {
  return knex.schema.table('grads', function (table) {
    table.text('skills')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('grads', function (table) {
    table.dropColumn('skills')
  })
}
