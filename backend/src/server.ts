import { createApp } from './app.js';
import { config } from './config/env.js';
import { initializeDatabase } from './db/index.js';

// Initialize database schema
console.log('🔧 Initializing database...');
initializeDatabase();

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
});
