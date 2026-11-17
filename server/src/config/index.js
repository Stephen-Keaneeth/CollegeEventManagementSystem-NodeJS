const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_super_secret_jwt_key_2026_campus_pulse',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  db: {
    engine: (process.env.DB_ENGINE || 'auto').toLowerCase(),
    mysql: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'college_events',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    },
    sqlite: {
      filePath: path.join(__dirname, '../../', process.env.SQLITE_FILE || 'college_events.db')
    }
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
