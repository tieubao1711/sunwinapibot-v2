const {
  createWithdrawal,
  createWithdrawalByToken
} = require('../services/apiClient');
const { buildWithdrawResultMessage, escapeHtml } = require('../utils/formatters');
const { extractAxiosError, threadOptions } = require('../utils/botUtils');

async function handleWithdrawCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const payload = parseWithdrawInput(match?.[1] || '');

  if (!payload) {
    await bot.sendMessage(
      chatId,
      [
        'Cach dung:',
        '/ruttien accessToken amount',
        '/ruttien username|password amount',
        '/ruttien username password amount',
        '',
        'Vi du:',
        '/ruttien eyJhbGciOi... 200000',
        '/ruttien user01|pass123 200000'
      ].join('\n'),
      threadOptions(msg)
    );
    return;
  }

  await bot.sendMessage(chatId, 'Dang tao lenh rut tien...', threadOptions(msg));

  try {
    const response = payload.mode === 'token'
      ? await createWithdrawalByToken(payload.accessToken, payload.amount)
      : await createWithdrawal(payload.username, payload.password, payload.amount);

    await bot.sendMessage(chatId, buildWithdrawResultMessage(response, payload.amount), threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Rut tien that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

function parseWithdrawInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (raw.includes('|')) {
    const firstSpaceIndex = raw.search(/\s/);
    if (firstSpaceIndex < 0) return null;

    const credentialPart = raw.slice(0, firstSpaceIndex).trim();
    const amount = parseAmount(raw.slice(firstSpaceIndex).trim());
    if (!credentialPart || !amount || !credentialPart.includes('|')) return null;

    const [username, ...passwordParts] = credentialPart.split('|');
    const password = passwordParts.join('|');
    if (!username.trim() || !password.trim()) return null;

    return {
      mode: 'credentials',
      username: username.trim(),
      password: password.trim(),
      amount
    };
  }

  const args = raw.split(/\s+/).filter(Boolean);
  if (args.length === 2) {
    const amount = parseAmount(args[1]);
    if (!amount) return null;

    return {
      mode: 'token',
      accessToken: args[0],
      amount
    };
  }

  if (args.length < 3) return null;

  const amount = parseAmount(args[2]);
  if (!amount) return null;

  return {
    mode: 'credentials',
    username: args[0],
    password: args[1],
    amount
  };
}

function parseAmount(value) {
  const amount = Number(String(value || '').replace(/[,. ]/g, ''));
  if (!Number.isInteger(amount) || amount <= 0) return 0;
  return amount;
}

module.exports = {
  handleWithdrawCommand,
  parseWithdrawInput
};
