/**
 * Core schema: users, roles, user_roles, workspaces, workspace_members, projects, sprints, issues, boards, columns, audit_log, webhook_subscriptions
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('email').notNullable().unique();
    t.string('name').notNullable();
    t.string('password_hash');
    t.boolean('mfa_enabled').defaultTo(false);
    t.string('mfa_secret');
    t.timestamp('created_at');
    t.timestamp('updated_at');
  });

  await knex.schema.createTable('roles', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable().unique();
    t.jsonb('permissions').defaultTo('[]');
    t.timestamp('created_at');
    t.timestamp('updated_at');
  });

  await knex.schema.createTable('user_roles', (t) => {
    t.integer('user_id').references('users.id').onDelete('CASCADE');
    t.integer('role_id').references('roles.id').onDelete('CASCADE');
    t.string('scope'); // global|workspace:<id>|project:<id>
    t.primary(['user_id','role_id','scope']);
  });

  await knex.schema.createTable('workspaces', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.text('description');
    t.boolean('archived').defaultTo(false);
    t.timestamp('created_at');
    t.timestamp('updated_at');
  });

  await knex.schema.createTable('workspace_members', (t) => {
    t.increments('id').primary();
    t.integer('workspace_id').references('workspaces.id').onDelete('CASCADE');
    t.integer('user_id').references('users.id').onDelete('CASCADE');
    t.string('role').defaultTo('member'); // member|admin
    t.timestamp('created_at');
    t.timestamp('updated_at');
    t.unique(['workspace_id','user_id']);
  });

  await knex.schema.createTable('projects', (t) => {
    t.increments('id').primary();
    t.integer('workspace_id').references('workspaces.id').onDelete('CASCADE');
    t.string('key').notNullable(); // e.g., ABC
    t.string('name').notNullable();
    t.text('description');
    t.jsonb('workflow').defaultTo('{}'); // configurable workflow
    t.boolean('archived').defaultTo(false);
    t.timestamp('created_at');
    t.timestamp('updated_at');
    t.unique(['workspace_id', 'key']);
  });

  await knex.schema.createTable('sprints', (t) => {
    t.increments('id').primary();
    t.integer('project_id').references('projects.id').onDelete('CASCADE');
    t.string('name').notNullable();
    t.date('start_date');
    t.date('end_date');
    t.string('state').defaultTo('planned'); // planned|active|completed
    t.integer('goal_points').defaultTo(0);
    t.timestamp('created_at');
    t.timestamp('updated_at');
  });

  await knex.schema.createTable('issues', (t) => {
    t.increments('id').primary();
    t.integer('project_id').references('projects.id').onDelete('CASCADE');
    t.integer('sprint_id').references('sprints.id').onDelete('SET NULL');
    t.string('type').defaultTo('task'); // task|bug|story|epic
    t.string('key').notNullable(); // ABC-1
    t.string('title').notNullable();
    t.text('description');
    t.string('status').defaultTo('todo');
    t.integer('assignee_id').references('users.id').onDelete('SET NULL');
    t.integer('reporter_id').references('users.id').onDelete('SET NULL');
    t.integer('story_points');
    t.integer('priority').defaultTo(3); // 1-high 5-low
    t.boolean('archived').defaultTo(false);
    t.jsonb('custom_fields').defaultTo('{}');
    t.timestamp('created_at');
    t.timestamp('updated_at');
    t.unique(['project_id','key']);
  });

  await knex.schema.createTable('boards', (t) => {
    t.increments('id').primary();
    t.integer('project_id').references('projects.id').onDelete('CASCADE');
    t.string('name').notNullable();
    t.jsonb('columns').defaultTo(JSON.stringify([
      { key: 'todo', name: 'To Do', wipLimit: null },
      { key: 'in_progress', name: 'In Progress', wipLimit: null },
      { key: 'done', name: 'Done', wipLimit: null }
    ]));
    t.timestamp('created_at');
    t.timestamp('updated_at');
  });

  await knex.schema.createTable('audit_log', (t) => {
    t.increments('id').primary();
    t.integer('actor_id').references('users.id');
    t.string('method');
    t.string('path');
    t.integer('status');
    t.string('ip');
    t.string('user_agent');
    t.string('request_id');
    t.jsonb('payload');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('webhook_subscriptions', (t) => {
    t.increments('id').primary();
    t.string('target_url').notNullable();
    t.string('event').notNullable(); // issue.created, sprint.started, etc.
    t.boolean('active').defaultTo(true);
    t.timestamp('created_at');
    t.timestamp('updated_at');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('webhook_subscriptions');
  await knex.schema.dropTableIfExists('audit_log');
  await knex.schema.dropTableIfExists('boards');
  await knex.schema.dropTableIfExists('issues');
  await knex.schema.dropTableIfExists('sprints');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('workspace_members');
  await knex.schema.dropTableIfExists('workspaces');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('users');
};
