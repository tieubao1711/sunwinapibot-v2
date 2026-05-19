const TelegramBot = require('node-telegram-bot-api');
const env = require('./config/env');
const { registerBotHandlers } = require('./handlers/botHandler');

if (!env.telegramBotToken) {
  console.error('Missing TELEGRAM_BOT_TOKEN in environment.');
  process.exit(1);
}

const bot = new TelegramBot(env.telegramBotToken, {
  polling: true
});

registerBotHandlers(bot);

bot.on('polling_error', (error) => {
  console.error('Polling error:', error?.message || error);
});

console.log('Telegram bot is running with polling.');
