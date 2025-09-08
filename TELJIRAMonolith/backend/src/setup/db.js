const knexConfig = require('../../knexfile');
const { Model } = require('objection');

let knex;

async function initDb() {
  const Knex = require('knex');
  knex = Knex(knexConfig);
  Model.knex(knex);
  await knex.raw('select 1+1 as result');
  return knex;
}

function getDb() {
  if (!knex) throw new Error('DB not initialized');
  return knex;
}

module.exports = { initDb, getDb, Model };
