const dotenv = require('dotenv');

dotenv.config();

function parseTimeout(value) {
  const timeout = Number(value || 30000);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 30000;
}

module.exports = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  apiBaseUrl: (process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  historyApiBaseUrl: (process.env.HISTORY_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  requestTimeoutMs: parseTimeout(process.env.REQUEST_TIMEOUT_MS),
  adminUsername: process.env.ADMIN_USERNAME || '',
  adminPassword: process.env.ADMIN_PASSWORD || ''
};
