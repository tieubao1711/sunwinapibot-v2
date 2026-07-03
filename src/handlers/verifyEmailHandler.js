const { verifyEmail } = require('../services/apiClient');
const { escapeHtml } = require('../utils/formatters');
const { extractAxiosError, threadOptions } = require('../utils/botUtils');

async function handleVerifyEmailCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const payload = parseVerifyEmailInput(match?.[1] || '');

  if (!payload) {
    await bot.sendMessage(
      chatId,
      [
        'Cach dung:',
        '/verifyemail username password',
        '/verifyemail username|password',
        '/verifyemail username password email otp',
        '/verifyemail username|password email otp',
        '',
        'Vi du:',
        '/verifyemail user01 pass123',
        '/verifyemail user01|pass123 abc@sunmail.site 123456'
      ].join('\n'),
      threadOptions(msg)
    );
    return;
  }

  await bot.sendMessage(chatId, 'Dang xac minh email...', threadOptions(msg));

  try {
    const response = await verifyEmail(payload.username, payload.password, payload.email, payload.otp);
    const result = normalizeVerifyEmailResponse(response);

    if (!result.success) {
      await bot.sendMessage(chatId, `<b>Xac minh email that bai</b>\n<code>${escapeHtml(result.message)}</code>`, threadOptions(msg, {
        parse_mode: 'HTML'
      }));
      return;
    }

    await bot.sendMessage(chatId, buildVerifyEmailMessage(result), threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Xac minh email that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

function parseVerifyEmailInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (raw.includes('|')) {
    const firstSpaceIndex = raw.search(/\s/);
    const credentialPart = firstSpaceIndex < 0 ? raw : raw.slice(0, firstSpaceIndex).trim();
    const rest = firstSpaceIndex < 0 ? [] : raw.slice(firstSpaceIndex).trim().split(/\s+/).filter(Boolean);
    const [username, ...passwordParts] = credentialPart.split('|');
    const password = passwordParts.join('|');
    if (!username.trim() || !password.trim()) return null;

    return normalizeOptionalEmailOtp({
      username: username.trim(),
      password: password.trim(),
      rest
    });
  }

  const args = raw.split(/\s+/).filter(Boolean);
  if (args.length < 2) return null;

  return normalizeOptionalEmailOtp({
    username: args[0],
    password: args[1],
    rest: args.slice(2)
  });
}

function normalizeOptionalEmailOtp({ username, password, rest }) {
  let email = '';
  let otp = '';

  if (rest.length === 1) {
    if (isEmailLike(rest[0])) email = rest[0];
    else otp = rest[0];
  } else if (rest.length >= 2) {
    email = rest[0];
    otp = rest[1];
    if (!isEmailLike(email)) return null;
  }

  return {
    username,
    password,
    email,
    otp
  };
}

function isEmailLike(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function normalizeVerifyEmailResponse(response) {
  const data = response?.data || response || {};
  const confirmed = data.confirmed ?? data.data?.confirmed;
  const success = response?.success === true || data?.success === true || confirmed === true || response?.ok === true;
  const message =
    data.message ||
    data.data?.message ||
    response?.message ||
    (success ? 'Xac minh email thanh cong' : 'Xac minh email that bai');

  return {
    success,
    message,
    email: data.email || data.data?.email || '',
    confirmedEmail: data.confirmedEmail || data.data?.confirmedEmail || '',
    confirmed,
    otp: data.otp || data.data?.otp || ''
  };
}

function buildVerifyEmailMessage(result) {
  const lines = [
    '<b>XAC MINH EMAIL THANH CONG</b>',
    `Email: <code>${escapeHtml(result.confirmedEmail || result.email || '-')}</code>`,
    `Confirmed: <b>${result.confirmed ? 'true' : 'false'}</b>`
  ];

  if (result.otp) {
    lines.push(`OTP: <code>${escapeHtml(result.otp)}</code>`);
  }

  if (result.message) {
    lines.push(`Thong bao: ${escapeHtml(result.message)}`);
  }

  return lines.join('\n');
}

module.exports = {
  handleVerifyEmailCommand,
  parseVerifyEmailInput
};
