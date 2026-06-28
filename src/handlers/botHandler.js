const { handleInfoCommand } = require('./accountHandler');
const {
  handleAdminLoginCommand,
  handleAdminStatusCommand,
  handleSetGroupCommand,
  handleSetTopicCommand
} = require('./adminHandler');
const { handleChangePassCommand } = require('./changePassHandler');
const { handleHistoryCommand } = require('./historyHandler');
const { handleWithdrawCommand } = require('./withdrawHandler');
const {
  commandRegex,
  helpMessage,
  isCommandForThisBot,
  parseBotCommand,
  threadOptions
} = require('../utils/botUtils');
const {
  getAdminCommandBlockReason,
  getUserCommandBlockReason,
  shouldHandleAdminCommand,
  shouldHandleUserCommand
} = require('../services/adminState');

const ADMIN_COMMANDS = new Set(['adminlogin', 'setgroup', 'settopic', 'adminstatus']);
const USER_COMMANDS = new Set(['start', 'help', 'info', 'history', 'changepass', 'ruttien']);
const ALL_COMMANDS = new Set([...ADMIN_COMMANDS, ...USER_COMMANDS]);

function registerBotHandlers(bot, botUsername = '') {
  bot.onText(commandRegex('start', false), withUserGuard(bot, botUsername, async (msg) => {
    await bot.sendMessage(msg.chat.id, helpMessage(), threadOptions(msg, { parse_mode: 'HTML' }));
  }));

  bot.onText(commandRegex('help', false), withUserGuard(bot, botUsername, async (msg) => {
    await bot.sendMessage(msg.chat.id, helpMessage(), threadOptions(msg, { parse_mode: 'HTML' }));
  }));

  bot.onText(commandRegex('adminlogin'), withAdminGuard(bot, botUsername, (msg, match) => {
    return handleAdminLoginCommand(bot, msg, match);
  }));

  bot.onText(commandRegex('setgroup'), withAdminGuard(bot, botUsername, (msg, match) => {
    return handleSetGroupCommand(bot, msg, match);
  }));

  bot.onText(commandRegex('settopic'), withAdminGuard(bot, botUsername, (msg, match) => {
    return handleSetTopicCommand(bot, msg, match);
  }));

  bot.onText(commandRegex('adminstatus', false), withAdminGuard(bot, botUsername, (msg) => {
    return handleAdminStatusCommand(bot, msg);
  }));

  bot.onText(commandRegex('info'), withUserGuard(bot, botUsername, (msg, match) => {
    return handleInfoCommand(bot, msg, match);
  }));

  bot.onText(commandRegex('history'), withUserGuard(bot, botUsername, (msg, match) => {
    return handleHistoryCommand(bot, msg, match);
  }));

  bot.onText(commandRegex('changepass'), withUserGuard(bot, botUsername, (msg, match) => {
    return handleChangePassCommand(bot, msg, match);
  }));

  bot.onText(commandRegex('ruttien'), withUserGuard(bot, botUsername, (msg, match) => {
    return handleWithdrawCommand(bot, msg, match);
  }));

  bot.on('message', async (msg) => {
    const parsed = parseBotCommand(msg.text);
    if (!parsed || ALL_COMMANDS.has(parsed.command)) return;
    if (!isCommandForThisBot(msg, botUsername)) return;
    if (msg.chat?.type === 'private') return;

    await safeSend(bot, msg, [
      `Khong ho tro lenh /${parsed.command}.`,
      'Dung /help de xem cac lenh hop le.'
    ].join('\n'));
  });
}

function withUserGuard(bot, botUsername, handler) {
  return async (msg, match) => {
    if (!isCommandForThisBot(msg, botUsername)) return;
    if (msg.chat?.type === 'private') return;

    if (!shouldHandleUserCommand(msg)) {
      await safeSend(bot, msg, getUserCommandBlockReason(msg));
      return;
    }

    await runHandler(bot, msg, () => handler(msg, match));
  };
}

function withAdminGuard(bot, botUsername, handler) {
  return async (msg, match) => {
    if (!isCommandForThisBot(msg, botUsername)) return;
    if (msg.chat?.type === 'private') return;

    if (!shouldHandleAdminCommand(msg)) {
      await safeSend(bot, msg, getAdminCommandBlockReason(msg));
      return;
    }

    await runHandler(bot, msg, () => handler(msg, match));
  };
}

async function runHandler(bot, msg, fn) {
  try {
    await fn();
  } catch (error) {
    console.error('Command handler error:', {
      chatId: msg.chat?.id,
      userId: msg.from?.id,
      text: msg.text,
      error: error?.stack || error?.message || error
    });
    await safeSend(bot, msg, 'Bot gap loi khi xu ly lenh nay. Xem pm2 logs de biet chi tiet.');
  }
}

async function safeSend(bot, msg, text, options = {}) {
  if (!text) return;
  try {
    await bot.sendMessage(msg.chat.id, text, threadOptions(msg, options));
  } catch (error) {
    console.error('Failed to send message:', error?.message || error);
  }
}

module.exports = { registerBotHandlers };
