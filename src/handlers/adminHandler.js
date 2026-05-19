const env = require('../config/env');
const {
  getGroupConfig,
  isAdminLoggedIn,
  loginAdmin,
  setGroupId,
  setTopicId
} = require('../services/adminState');
const { escapeHtml } = require('../utils/formatters');
const { threadOptions } = require('../utils/botUtils');

async function handleAdminLoginCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const credentials = parseAdminLogin(match?.[1] || '');

  if (!env.adminUsername || !env.adminPassword) {
    await bot.sendMessage(chatId, 'Chua cau hinh ADMIN_USERNAME va ADMIN_PASSWORD trong .env.', threadOptions(msg));
    return;
  }

  if (!credentials) {
    await bot.sendMessage(chatId, 'Cach dung: /adminlogin username password', threadOptions(msg));
    return;
  }

  if (credentials.username !== env.adminUsername || credentials.password !== env.adminPassword) {
    await bot.sendMessage(chatId, 'Dang nhap admin that bai.', threadOptions(msg));
    return;
  }

  loginAdmin(msg.from.id);
  await bot.sendMessage(chatId, 'Dang nhap admin thanh cong.', threadOptions(msg));
}

async function handleSetGroupCommand(bot, msg, match) {
  const chatId = msg.chat.id;

  if (!(await ensureAdmin(bot, msg))) return;

  const input = String(match?.[1] || '').trim();
  const groupId = input || String(chatId);
  if (!isNumericId(groupId)) {
    await bot.sendMessage(chatId, 'Group id khong hop le.', threadOptions(msg));
    return;
  }

  const config = setGroupId(groupId);

  if (!config.groupId) {
    await bot.sendMessage(chatId, 'Group id khong hop le.', threadOptions(msg));
    return;
  }

  await bot.sendMessage(chatId, `Da set group id: <code>${escapeHtml(config.groupId)}</code>`, threadOptions(msg, {
    parse_mode: 'HTML'
  }));
}

async function handleSetTopicCommand(bot, msg, match) {
  const chatId = msg.chat.id;

  if (!(await ensureAdmin(bot, msg))) return;

  const input = String(match?.[1] || '').trim();
  const topicId = input || String(msg.message_thread_id || '');

  if (!topicId) {
    await bot.sendMessage(chatId, 'Khong tim thay topic id. Hay dung trong topic hoac nhap /settopic topicId.', threadOptions(msg));
    return;
  }

  if (!isNumericId(topicId)) {
    await bot.sendMessage(chatId, 'Topic id khong hop le.', threadOptions(msg));
    return;
  }

  const config = setTopicId(topicId);
  if (!config.topicId) {
    await bot.sendMessage(chatId, 'Topic id khong hop le.', threadOptions(msg));
    return;
  }

  await bot.sendMessage(chatId, `Da set topic id: <code>${escapeHtml(config.topicId)}</code>`, threadOptions(msg, {
    parse_mode: 'HTML'
  }));
}

async function handleAdminStatusCommand(bot, msg) {
  if (!(await ensureAdmin(bot, msg))) return;

  const config = getGroupConfig();
  await bot.sendMessage(
    msg.chat.id,
    [
      '<b>Admin config</b>',
      `Group id: <code>${escapeHtml(config.groupId || 'chua set')}</code>`,
      `Topic id: <code>${escapeHtml(config.topicId || 'tat ca topic')}</code>`
    ].join('\n'),
    threadOptions(msg, { parse_mode: 'HTML' })
  );
}

async function ensureAdmin(bot, msg) {
  if (isAdminLoggedIn(msg.from.id)) return true;
  await bot.sendMessage(msg.chat.id, 'Ban can dang nhap admin bang /adminlogin username password.', threadOptions(msg));
  return false;
}

function parseAdminLogin(input) {
  const args = String(input || '').trim().split(/\s+/).filter(Boolean);
  if (args.length < 2) return null;
  return {
    username: args[0],
    password: args.slice(1).join(' ')
  };
}

function isNumericId(value) {
  return /^-?\d+$/.test(String(value || '').trim());
}

module.exports = {
  handleAdminLoginCommand,
  handleAdminStatusCommand,
  handleSetGroupCommand,
  handleSetTopicCommand
};
