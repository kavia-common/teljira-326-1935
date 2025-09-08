const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool;

/**
 * Initialize PostgreSQL connection pool using environment variables.
 */
async function initDb() {
  if (pool) return pool;
  pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  pool.on('error', (err) => {
    logger.error('Unexpected PG error', { err });
  });
  await pool.query('SELECT 1');
  logger.info('Database connected');
  return pool;
}

/**
 * Get the DB pool, ensure initDb was called before.
 */
function getDb() {
  if (!pool) {
    throw new Error('DB not initialized. Call initDb() first.');
  }
  return pool;
}

/**
 * Close DB pool connections.
 */
async function closeDb() {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
    pool = undefined;
  }
}

module.exports = { initDb, getDb, closeDb };
