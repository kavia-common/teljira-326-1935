const { Sprint } = require('../models/Sprint');
const { Issue } = require('../models/Issue');
const { HttpError } = require('../setup/errors');
const { emit } = require('../plugins');
const webhook = require('./webhookService');

// PUBLIC_INTERFACE
async function list(projectId) {
  /** Lists sprints for a project */
  return Sprint.query().where({ project_id: projectId });
}

// PUBLIC_INTERFACE
async function create(projectId, { name, start_date, end_date, goal_points }) {
  /** Creates a sprint */
  const s = await Sprint.query().insertAndFetch({ project_id: projectId, name, start_date, end_date, goal_points, state: 'planned' });
  emit('onSprintCreated', s);
  webhook.publish('sprint.created', { id: s.id, project_id: s.project_id });
  return s;
}

// PUBLIC_INTERFACE
async function start(sprintId) {
  /** Starts a planned sprint */
  const sprint = await Sprint.query().findById(sprintId);
  if (!sprint) throw new HttpError(404, 'not_found', 'Sprint not found');
  if (sprint.state !== 'planned') throw new HttpError(400, 'invalid_state', 'Sprint not in planned state');
  const s = await Sprint.query().patchAndFetchById(sprintId, { state: 'active' });
  emit('onSprintStarted', s);
  webhook.publish('sprint.started', { id: s.id });
  return s;
}

// PUBLIC_INTERFACE
async function complete(sprintId) {
  /** Completes an active sprint */
  const sprint = await Sprint.query().findById(sprintId);
  if (!sprint) throw new HttpError(404, 'not_found', 'Sprint not found');
  if (sprint.state !== 'active') throw new HttpError(400, 'invalid_state', 'Sprint not active');
  // Optionally move unfinished issues back to backlog
  await Issue.query().where({ sprint_id: sprintId }).whereNot('status','done').patch({ sprint_id: null });
  const s = await Sprint.query().patchAndFetchById(sprintId, { state: 'completed' });
  emit('onSprintCompleted', s);
  webhook.publish('sprint.completed', { id: s.id });
  return s;
}

module.exports = { list, create, start, complete };
