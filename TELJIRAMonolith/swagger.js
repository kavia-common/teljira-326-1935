const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SprintFlow API',
      version: '0.1.0',
      description: 'SprintFlow - Jira-like work management API',
      termsOfService: 'https://example.com/tos',
      contact: { name: 'SprintFlow', email: 'support@example.com' }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.'
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Service health' },
      { name: 'Auth', description: 'Authentication and User sessions' },
      { name: 'Users', description: 'User directory and profiles' },
      { name: 'Teams', description: 'Teams and memberships' },
      { name: 'RBAC', description: 'Roles and permissions' },
      { name: 'Workspaces', description: 'Organization workspaces' },
      { name: 'Projects', description: 'Projects management' },
      { name: 'Boards', description: 'Kanban/Scrum boards' },
      { name: 'Sprints', description: 'Sprints lifecycle' },
      { name: 'Issues', description: 'Tasks, stories, bugs' },
      { name: 'Backlog', description: 'Backlog management' },
      { name: 'Automation', description: 'Rules and triggers' },
      { name: 'Reports', description: 'Metrics and reporting' },
      { name: 'Settings', description: 'Admin and project settings' },
      { name: 'Webhooks', description: 'Webhook subscriptions' }
    ]
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
