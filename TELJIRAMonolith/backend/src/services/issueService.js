const { Issue } = require('../models/Issue');
const { Project } = require('../models/Project');
const { HttpError } = require('../setup/errors');
const { emit } = require('../plugins');
const webhook = require('./webhookService');

// PUBLIC_INTERFACE
async function backlog(projectId) {
  /** Returns non-archived issues without sprint (backlog) */
  return Issue.query().where({ project_id: projectId, archived: false }).whereNull('sprint_id');
}

// PUBLIC_INTERFACE
async function create(projectId, data) {
  /** Creates a new issue within project: generates key like ABC-<seq> */
  const project = await Project.query().findById(projectId);
  if (!project) throw new HttpError(404, 'not_found', 'Project not found');

  const [{ count }] = await Issue.query()
    .where({ project_id: projectId })
    .count();
  const seq = Number(count) + 1;
  const key = `${project.key}-${seq}`;

  const issue = await Issue.query().insertAndFetch({
    project_id: projectId,
    type: data.type || 'task',
    key,
    title: data.title,
    description: data.description || '',
    status: 'todo',
    reporter_id: data.reporter_id || null,
    assignee_id: data.assignee_id || null,
    story_points: data.story_points || null,
    priority: data.priority || 3,
    custom_fields: data.custom_fields || {}
  });

  emit('onIssueCreated', issue);
  webhook.publish('issue.created', { id: issue.id, key: issue.key });

  return issue;
}

// PUBLIC_INTERFACE
async function update(issueId, patch) {
  /** Updates issue fields */
  const updated = await Issue.query().patchAndFetchById(issueId, patch);
  if (patch.status) {
    emit('onIssueTransition', { issueId, status: patch.status });
    webhook.publish('issue.transitioned', { id: issueId, status: patch.status });
  }
  return updated;
}

// PUBLIC_INTERFACE
async function transition(issueId, status) {
  /** Moves issue to a new status */
  const valid = ['todo','in_progress','done'];
  if (!valid.includes(status)) throw new HttpError(400, 'invalid_status', 'Invalid status');
  const updated = await Issue.query().patchAndFetchById(issueId, { status });
  emit('onIssueTransition', { issueId, status });
  webhook.publish('issue.transitioned', { id: issueId, status });
  return updated;
}

module.exports = { backlog, create, update, transition };
