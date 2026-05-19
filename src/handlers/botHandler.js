const { handleInfoCommand } = require('./accountHandler');
const {
  handleAdminLoginCommand,
  handleAdminStatusCommand,
  handleSetGroupCommand,
  handleSetTopicCommand
} = require('./adminHandler');
const { handleChangePassCommand } = require('./changePassHandler');
const { handleHistoryCommand } = require('./historyHandler');
const { commandRegex, helpMessage, threadOptions } = require('../utils/botUtils');
const {
  shouldHandleAdminCommand,
  shouldHandleUserCommand
} = require('../services/adminState');

function registerBotHandlers(bot) {
  bot.onText(commandRegex('start', false), async (msg) => {
    if (!shouldHandleUserCommand(msg)) return;
    await bot.sendMessage(msg.chat.id, helpMessage(), threadOptions(msg, { parse_mode: 'HTML' }));
  });

  bot.onText(commandRegex('help', false), async (msg) => {
    if (!shouldHandleUserCommand(msg)) return;
    await bot.sendMessage(msg.chat.id, helpMessage(), threadOptions(msg, { parse_mode: 'HTML' }));
  });

  bot.onText(commandRegex('adminlogin'), (msg, match) => {
    if (!shouldHandleAdminCommand(msg)) return;
    return handleAdminLoginCommand(bot, msg, match);
  });

  bot.onText(commandRegex('setgroup'), (msg, match) => {
    if (!shouldHandleAdminCommand(msg)) return;
    return handleSetGroupCommand(bot, msg, match);
  });

  bot.onText(commandRegex('settopic'), (msg, match) => {
    if (!shouldHandleAdminCommand(msg)) return;
    return handleSetTopicCommand(bot, msg, match);
  });

  bot.onText(commandRegex('adminstatus', false), (msg) => {
    if (!shouldHandleAdminCommand(msg)) return;
    return handleAdminStatusCommand(bot, msg);
  });

  bot.onText(commandRegex('info'), (msg, match) => {
    if (!shouldHandleUserCommand(msg)) return;
    return handleInfoCommand(bot, msg, match);
  });

  bot.onText(commandRegex('history'), (msg, match) => {
    if (!shouldHandleUserCommand(msg)) return;
    return handleHistoryCommand(bot, msg, match);
  });

  bot.onText(commandRegex('changepass'), (msg, match) => {
    if (!shouldHandleUserCommand(msg)) return;
    return handleChangePassCommand(bot, msg, match);
  });
}

module.exports = { registerBotHandlers };
