const { fetchAccountInfo } = require('../services/apiClient');
const { buildBasicInfoMessage, escapeHtml } = require('../utils/formatters');
const {
  extractAxiosError,
  getSessionKey,
  parseCredentials,
  threadOptions
} = require('../utils/botUtils');

const sessions = new Map();

async function handleInfoCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const credentials = parseCredentials(match?.[1] || '');
  if (!credentials) {
    await bot.sendMessage(chatId, 'Cach dung: /info username password hoac /info username|password', threadOptions(msg));
    return;
  }

  await bot.sendMessage(chatId, 'Dang dang nhap va lay thong tin...', threadOptions(msg));

  try {
    const response = await fetchAccountInfo(credentials.username, credentials.password);
    const accountData = normalizeAccountData(response);

    if (!accountData.ok) {
      await bot.sendMessage(chatId, `Login that bai: <code>${escapeHtml(accountData.message)}</code>`, threadOptions(msg, {
        parse_mode: 'HTML'
      }));
      return;
    }

    if (accountData.accessToken || accountData.session) {
      sessions.set(getSessionKey(chatId, userId), {
        username: credentials.username,
        password: credentials.password,
        accessToken: accountData.accessToken,
        session: accountData.session,
        profile: accountData.data?.profile
      });
    }

    await bot.sendMessage(chatId, buildBasicInfoMessage(accountData.data), threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Lay thong tin that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

function normalizeAccountData(response) {
  const data = response?.data || response || {};
  const success = response?.success !== false && data?.success !== false;
  const accessToken = data?.accessToken || data?.access_token || response?.accessToken;
  const session = data?.session || data?.sessionId || response?.session;
  const hasAccountShape = Boolean(data?.profile || data?.walletInfo || data?.wallet || accessToken || session);

  return {
    ok: success && hasAccountShape,
    message: response?.message || data?.message || 'Khong lay duoc thong tin tai khoan',
    data,
    accessToken,
    session
  };
}

module.exports = {
  handleInfoCommand,
  sessions
};
