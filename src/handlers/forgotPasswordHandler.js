const { forgotPassword } = require('../services/apiClient');
const { escapeHtml } = require('../utils/formatters');
const { extractAxiosError, threadOptions } = require('../utils/botUtils');

async function handleForgotPasswordCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const payload = parseForgotPasswordInput(match?.[1] || '');

  if (!payload) {
    await bot.sendMessage(
      chatId,
      [
        'Cach dung:',
        '/forgotpass username newPassword',
        '/forgotpass username email newPassword',
        '',
        'Vi du:',
        '/forgotpass user01 NewPass123',
        '/forgotpass user01 user01@gmail.com NewPass123'
      ].join('\n'),
      threadOptions(msg)
    );
    return;
  }

  await bot.sendMessage(chatId, 'Dang xu ly quen mat khau...', threadOptions(msg));

  try {
    const response = await forgotPassword(payload.username, payload.email, payload.newPassword);
    const result = normalizeForgotPasswordResponse(response);

    if (!result.success) {
      await bot.sendMessage(chatId, `<b>Dat lai mat khau that bai</b>\n<code>${escapeHtml(result.message)}</code>`, threadOptions(msg, {
        parse_mode: 'HTML'
      }));
      return;
    }

    await bot.sendMessage(chatId, `<b>${escapeHtml(result.message)}</b>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Dat lai mat khau that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

function parseForgotPasswordInput(input) {
  const args = String(input || '').trim().split(/\s+/).filter(Boolean);
  if (args.length < 2) return null;

  const username = args[0];
  let email = '';
  let newPasswordParts = args.slice(1);

  if (args[1]?.includes('@')) {
    if (args.length < 3) return null;
    email = args[1];
    newPasswordParts = args.slice(2);
  }

  const newPassword = newPasswordParts.join(' ');

  if (!username || !newPassword) return null;

  return {
    username,
    email,
    newPassword
  };
}

function normalizeForgotPasswordResponse(response) {
  const status = response?.data?.status ?? response?.status;
  const success = response?.success === true || status === 0 || response?.ok === true;
  const message =
    response?.data?.data?.message ||
    response?.data?.message ||
    response?.message ||
    response?.msg ||
    (success ? 'Dat lai mat khau thanh cong' : 'Dat lai mat khau that bai');

  return { success, message };
}

module.exports = {
  handleForgotPasswordCommand,
  parseForgotPasswordInput
};
