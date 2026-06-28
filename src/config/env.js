const dotenv = require('dotenv');

dotenv.config();

function parseTimeout(value) {
  const timeout = Number(value || 30000);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 30000;
}

function parseBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

module.exports = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  apiBaseUrl: (process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  historyApiBaseUrl: (process.env.HISTORY_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  withdrawApiBaseUrl: (process.env.WITHDRAW_API_BASE_URL || 'http://localhost:4587').replace(/\/$/, ''),
  withdrawProxyPoolId: process.env.WITHDRAW_PROXY_POOL_ID || '',
  withdrawProxyId: process.env.WITHDRAW_PROXY_ID || '',
  withdrawForceReloadProxy: parseBoolean(process.env.WITHDRAW_FORCE_RELOAD_PROXY),
  requestTimeoutMs: parseTimeout(process.env.REQUEST_TIMEOUT_MS),
  adminUsername: process.env.ADMIN_USERNAME || '',
  adminPassword: process.env.ADMIN_PASSWORD || ''
};
