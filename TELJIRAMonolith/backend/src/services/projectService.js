const { Project } = require('../models/Project');
const { HttpError } = require('../setup/errors');

// PUBLIC_INTERFACE
async function list(workspaceId) {
  /** Lists projects by workspace */
  return Project.query().where({ workspace_id: workspaceId, archived: false });
}

// PUBLIC_INTERFACE
async function create(workspaceId, { key, name, description }) {
  /** Creates a project under a workspace */
  if (!key || !name) throw new HttpError(400, 'invalid_input', 'Key and name required');
  const exists = await Project.query().findOne({ workspace_id: workspaceId, key });
  if (exists) throw new HttpError(400, 'project_exists', 'Project key already exists');
  return Project.query().insertAndFetch({ workspace_id: workspaceId, key, name, description });
}

// PUBLIC_INTERFACE
async function archive(projectId, archived = true) {
  /** Archive or unarchive a project */
  return Project.query().patchAndFetchById(projectId, { archived });
}

module.exports = { list, create, archive };
