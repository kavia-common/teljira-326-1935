const argon2 = require('argon2');

exports.seed = async function(knex) {
  // Clear tables
  await knex('user_roles').del();
  await knex('roles').del();
  await knex('users').del();
  await knex('workspaces').del();
  await knex('projects').del();

  const roles = [
    { name: 'org_admin', permissions: ['*'] },
    { name: 'project_admin', permissions: ['project:*', 'issue:*', 'board:*', 'sprint:*'] },
    { name: 'scrum_master', permissions: ['sprint:*', 'issue:read', 'board:write'] },
    { name: 'developer', permissions: ['issue:read', 'issue:update', 'board:read'] },
    { name: 'qa', permissions: ['issue:read', 'issue:update'] },
    { name: 'viewer', permissions: ['issue:read', 'project:read', 'board:read', 'report:read'] }
  ];

  const [adminRoleId] = await knex('roles').insert(roles.map(r => ({
    name: r.name,
    permissions: JSON.stringify(r.permissions),
    created_at: new Date(),
    updated_at: new Date()
  }))).returning('id');

  const adminHash = await argon2.hash('admin123');
  const [adminId] = await knex('users').insert({
    email: 'admin@example.com',
    name: 'Admin',
    password_hash: adminHash,
    created_at: new Date(),
    updated_at: new Date()
  }).returning('id');

  await knex('user_roles').insert({
    user_id: typeof adminId === 'object' ? adminId.id : adminId,
    role_id: typeof adminRoleId === 'object' ? adminRoleId.id : adminRoleId,
    scope: 'global'
  });

  const [wsId] = await knex('workspaces').insert({
    name: 'Demo Workspace',
    description: 'Default workspace',
    created_at: new Date(),
    updated_at: new Date()
  }).returning('id');

  const [projId] = await knex('projects').insert({
    workspace_id: typeof wsId === 'object' ? wsId.id : wsId,
    key: 'DEMO',
    name: 'Demo Project',
    description: 'Sample project',
    workflow: JSON.stringify({ statuses: ['todo','in_progress','done'] }),
    created_at: new Date(),
    updated_at: new Date()
  }).returning('id');

  await knex('boards').insert({
    project_id: typeof projId === 'object' ? projId.id : projId,
    name: 'Demo Board',
    created_at: new Date(),
    updated_at: new Date()
  });
};
