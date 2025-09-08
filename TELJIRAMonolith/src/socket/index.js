const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.IO on provided server.
 * Rooms strategy:
 *   - global
 *   - project:{projectId}
 *   - user:{userId}
 */
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', process.env.SITE_URL].filter(Boolean),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { id: socket.id });

    socket.join('global');

    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { id: socket.id });
    });
  });

  return io;
}

/**
 * Get Socket.IO instance.
 */
function getIo() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

module.exports = { initSocket, getIo };
