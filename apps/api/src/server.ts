import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { initializeSocketIO } from './sockets';
import app from './app';

dotenv.config();

const httpServer = createServer(app);

// ============================================
// SOCKET.IO SETUP
// ============================================
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);
initializeSocketIO(io);

// Attach io to request object by re-injecting middleware
// (Needs to happen before routes, but for simplicity we can attach it globally here or in app.ts if we pass io)
// Actually, it's better to export io and have controllers use it.

// ============================================
// START SERVER
// ============================================
const PORT = parseInt(process.env.PORT || '5000');

const startServer = async () => {
  try {
    httpServer.listen(PORT, () => {
      logger.info(`🚀 AgriAssist API running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };
