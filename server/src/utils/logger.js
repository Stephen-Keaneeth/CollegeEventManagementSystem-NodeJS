// Clean formatted console logger with timestamps
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const getTimestamp = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

const logger = {
  info: (msg, ...args) => console.log(`${colors.cyan}[${getTimestamp()}] [INFO]${colors.reset} ${msg}`, ...args),
  success: (msg, ...args) => console.log(`${colors.green}[${getTimestamp()}] [SUCCESS]${colors.reset} ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`${colors.yellow}[${getTimestamp()}] [WARN]${colors.reset} ${msg}`, ...args),
  error: (msg, ...args) => console.error(`${colors.red}[${getTimestamp()}] [ERROR]${colors.reset} ${msg}`, ...args),
  db: (msg, ...args) => console.log(`${colors.magenta}[${getTimestamp()}] [DATABASE]${colors.reset} ${msg}`, ...args)
};

module.exports = logger;
