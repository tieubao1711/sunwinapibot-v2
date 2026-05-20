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

bot.on('polling_error', (error) => {
  console.error('Polling error:', error?.message || error);
});

start();

async function start() {
  let botUsername = '';

  try {
    const me = await bot.getMe();
    botUsername = me?.username || '';
  } catch (error) {
    console.error('Could not resolve bot username:', error?.message || error);
  }

  registerBotHandlers(bot, botUsername);
  console.log(`Telegram bot is running with polling${botUsername ? ` as @${botUsername}` : ''}.`);
}
