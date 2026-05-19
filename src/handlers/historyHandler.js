const { fetchLatestHistory } = require('../services/apiClient');
const { buildHistoryMessage, escapeHtml } = require('../utils/formatters');
const { extractAxiosError, parseCredentials, threadOptions } = require('../utils/botUtils');

async function handleHistoryCommand(bot, msg, match) {
  const chatId = msg.chat.id;

  const credentials = parseCredentials(match?.[1] || '');
  if (!credentials) {
    await bot.sendMessage(chatId, 'Cach dung: /history username password hoac /history username|password', threadOptions(msg));
    return;
  }

  await bot.sendMessage(chatId, 'Dang lay lich su moi nhat...', threadOptions(msg));

  try {
    const response = await fetchLatestHistory(credentials.username, credentials.password);
    const item = response?.item || response?.data?.item || response?.data || null;

    if (!item || response?.found === false) {
      await bot.sendMessage(chatId, 'Khong tim thay lich su cho tai khoan nay.', threadOptions(msg));
      return;
    }

    await bot.sendMessage(chatId, buildHistoryMessage(item), threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Lay lich su that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

module.exports = { handleHistoryCommand };
