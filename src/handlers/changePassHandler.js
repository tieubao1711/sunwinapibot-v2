const { changePasswordByLogin } = require('../services/apiClient');
const { escapeHtml } = require('../utils/formatters');
const { extractAxiosError, threadOptions } = require('../utils/botUtils');

async function handleChangePassCommand(bot, msg, match) {
  const chatId = msg.chat.id;

  const payload = parseChangePassInput(match?.[1] || '');
  if (!payload) {
    await bot.sendMessage(
      chatId,
      [
        'Cach dung:',
        '/changepass username|oldPassword newPassword',
        '/changepass username oldPassword newPassword'
      ].join('\n'),
      threadOptions(msg)
    );
    return;
  }

  await bot.sendMessage(chatId, 'Dang doi mat khau...', threadOptions(msg));

  try {
    const response = await changePasswordByLogin(payload.username, payload.password, payload.newPassword);
    const result = normalizeChangePasswordResponse(response);

    if (!result.success) {
      await bot.sendMessage(chatId, `<b>Doi mat khau that bai</b>\n<code>${escapeHtml(result.message)}</code>`, threadOptions(msg, {
        parse_mode: 'HTML'
      }));
      return;
    }

    await bot.sendMessage(chatId, `<b>${escapeHtml(result.message)}</b>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Doi mat khau that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

function parseChangePassInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (raw.includes('|')) {
    const firstSpaceIndex = raw.search(/\s/);
    if (firstSpaceIndex < 0) return null;

    const credentialPart = raw.slice(0, firstSpaceIndex).trim();
    const newPassword = raw.slice(firstSpaceIndex).trim();
    if (!credentialPart || !newPassword || !credentialPart.includes('|')) return null;

    const [username, ...passwordParts] = credentialPart.split('|');
    const password = passwordParts.join('|');
    if (!username.trim() || !password.trim()) return null;

    return {
      username: username.trim(),
      password: password.trim(),
      newPassword
    };
  }

  const args = raw.split(/\s+/).filter(Boolean);
  if (args.length < 3) return null;

  return {
    username: args[0],
    password: args[1],
    newPassword: args.slice(2).join(' ')
  };
}

function normalizeChangePasswordResponse(response) {
  const status = response?.data?.status ?? response?.status;
  const success = response?.success === true && (status === undefined || status === 0);
  const message =
    response?.data?.data?.message ||
    response?.data?.message ||
    response?.message ||
    (success ? 'Doi mat khau thanh cong' : 'Doi mat khau that bai');

  return { success, message };
}

module.exports = { handleChangePassCommand };
