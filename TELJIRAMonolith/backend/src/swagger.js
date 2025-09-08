const swaggerJSDoc = require('swagger-jsdoc');
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SprintFlow API',
      version: '0.1.0',
      description: 'REST API for SprintFlow monolith (projects, sprints, issues, users, RBAC, webhooks).'
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & MFA' },
      { name: 'Users', description: 'User and Role management' },
      { name: 'Workspaces', description: 'Workspaces and memberships' },
      { name: 'Projects', description: 'Projects and configurations' },
      { name: 'Sprints', description: 'Sprint lifecycle' },
      { name: 'Issues', description: 'Issues, backlog, boards' },
      { name: 'Boards', description: 'Boards and columns' },
      { name: 'Reports', description: 'Reports and analytics' },
      { name: 'Settings', description: 'Settings and integrations' },
      { name: 'Webhooks', description: 'Webhook subscriptions' }
    ]
  },
  apis: ['./routes/**/*.js']
};
module.exports = swaggerJSDoc(options);
