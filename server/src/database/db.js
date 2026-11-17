const config = require('../config');
const logger = require('../utils/logger');
const mysql = require('mysql2/promise');

let activeEngine = null; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

/**
 * Initializes the database connection according to config.db.engine:
 * - 'mysql': forces MySQL connection
 * - 'sqlite': forces Node.js built-in SQLite
 * - 'auto': tries MySQL first; if unreachable, falls back to SQLite
 */
async function initDb() {
  if (activeEngine) return activeEngine;

  const targetEngine = config.db.engine;

  if (targetEngine === 'mysql' || targetEngine === 'auto') {
    try {
      logger.db(`Attempting connection to MySQL at ${config.db.mysql.host}:${config.db.mysql.port}/${config.db.mysql.database}...`);
      
      // Attempt connection to verify server is reachable
      const connection = await mysql.createConnection({
        host: config.db.mysql.host,
        port: config.db.mysql.port,
        user: config.db.mysql.user,
        password: config.db.mysql.password,
        connectTimeout: 3000
      });

      // Ensure database exists
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.mysql.database}\`;`);
      await connection.end();

      mysqlPool = mysql.createPool(config.db.mysql);
      // Test query
      const [testResult] = await mysqlPool.query('SELECT 1 as connected');
      if (testResult && testResult[0].connected === 1) {
        activeEngine = 'mysql';
        logger.success(`Connected to MySQL successfully (${config.db.mysql.database})`);
        return 'mysql';
      }
    } catch (mysqlErr) {
      if (targetEngine === 'mysql') {
        logger.error(`MySQL connection failed: ${mysqlErr.message}`);
        throw mysqlErr;
      }
      logger.warn(`MySQL is not reachable (${mysqlErr.message}). Falling back to Node.js built-in SQLite storage.`);
    }
  }

  // Fallback or explicit SQLite mode using Node.js built-in node:sqlite
  try {
    const { DatabaseSync } = require('node:sqlite');
    sqliteDb = new DatabaseSync(config.db.sqlite.filePath);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
    activeEngine = 'sqlite';
    logger.success(`Connected to SQLite storage at: ${config.db.sqlite.filePath}`);
    return 'sqlite';
  } catch (sqliteErr) {
    logger.error(`Failed to initialize SQLite database: ${sqliteErr.message}`);
    throw sqliteErr;
  }
}

/**
 * Execute a SQL query and return normalized results
 * Handles SELECT (returns array) and INSERT/UPDATE/DELETE (returns { insertId, affectedRows })
 */
async function query(sql, params = []) {
  if (!activeEngine) {
    await initDb();
  }

  // Clean params to ensure undefined is null
  const sanitizedParams = params.map(p => (p === undefined ? null : p));

  if (activeEngine === 'mysql') {
    const [result] = await mysqlPool.query(sql, sanitizedParams);
    if (Array.isArray(result)) {
      return result;
    }
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }

  // SQLite implementation via DatabaseSync
  if (activeEngine === 'sqlite') {
    const trimmed = sql.trim();
    const isSelect = /^(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed);

    // SQLite parameter adaptation: replace boolean booleans with 1/0, convert objects to JSON
    const sqliteParams = sanitizedParams.map(val => {
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        return JSON.stringify(val);
      }
      if (val instanceof Date) {
        return val.toISOString().slice(0, 19).replace('T', ' ');
      }
      return val;
    });

    const stmt = sqliteDb.prepare(sql);

    if (isSelect) {
      const rows = stmt.all(...sqliteParams);
      // Normalize JSON string columns and booleans
      return rows.map(row => {
        const normalized = { ...row };
        for (const [key, val] of Object.entries(normalized)) {
          if ((key === 'is_active' || key === 'is_featured' || key === 'is_read') && typeof val === 'number') {
            normalized[key] = Boolean(val);
          }
          if (key === 'schedule_agenda' && typeof val === 'string') {
            try { normalized[key] = JSON.parse(val); } catch (_) {}
          }
        }
        return normalized;
      });
    } else {
      const info = stmt.run(...sqliteParams);
      return {
        insertId: Number(info.lastInsertRowid),
        affectedRows: Number(info.changes)
      };
    }
  }

  throw new Error('No database engine is active.');
}

/**
 * Executes raw multi-statement SQL strings (for schema migrations)
 */
async function executeRaw(rawSql) {
  if (!activeEngine) {
    await initDb();
  }

  if (activeEngine === 'mysql') {
    const statements = rawSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await mysqlPool.query(statement);
    }
    return true;
  }

  if (activeEngine === 'sqlite') {
    sqliteDb.exec(rawSql);
    return true;
  }
}

function getEngine() {
  return activeEngine;
}

module.exports = {
  initDb,
  query,
  executeRaw,
  getEngine
};
