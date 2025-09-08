const { HttpError } = require('../setup/errors');
const { getDb } = require('../setup/db');

// PUBLIC_INTERFACE
async function subscribe({ target_url, event }) {
  /** Subscribes to webhook events */
  if (!target_url || !event) throw new HttpError(400, 'invalid_input', 'target_url and event required');
  const db = getDb();
  const [id] = await db('webhook_subscriptions').insert({
    target_url, event, active: true, created_at: new Date(), updated_at: new Date()
  }).returning('id');
  return { id: typeof id === 'object' ? id.id : id };
}

// PUBLIC_INTERFACE
async function list() {
  /** Lists webhook subscriptions */
  const db = getDb();
  return db('webhook_subscriptions').select('*').orderBy('id', 'desc');
}

// PUBLIC_INTERFACE
async function publish(event, payload) {
  /** Publishes an event to active subscribers (log stub) */
  // In real use, queue async jobs and POST to target_url.
  if (process.env.WEBHOOK_OUTBOUND_ENABLED !== 'true') return;
  console.log('Webhook:', event, JSON.stringify(payload).slice(0, 200));
}

module.exports = { subscribe, list, publish };
