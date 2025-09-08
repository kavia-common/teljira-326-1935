const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const workspaceRoutes = require('../routes/workspaces');
const projectRoutes = require('../routes/projects');
const sprintRoutes = require('../routes/sprints');
const issueRoutes = require('../routes/issues');
const boardRoutes = require('../routes/boards');
const reportRoutes = require('../routes/reports');
const settingsRoutes = require('../routes/settings');
const webhookRoutes = require('../routes/webhooks');

function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/sprints', sprintRoutes);
  app.use('/api/issues', issueRoutes);
  app.use('/api/boards', boardRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/webhooks', webhookRoutes);
}

module.exports = { registerRoutes };
