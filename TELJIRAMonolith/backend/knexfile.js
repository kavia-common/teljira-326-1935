require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ssl =
  String(process.env.PG_SSL || 'false').toLowerCase() === 'true'
    ? { rejectUnauthorized: false }
    : false;

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  },
  pool: { min: 2, max: 10 }
};
