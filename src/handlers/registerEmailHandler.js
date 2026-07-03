const { registerEmail } = require('../services/apiClient');
const { escapeHtml } = require('../utils/formatters');
const { extractAxiosError, threadOptions } = require('../utils/botUtils');

async function handleRegisterEmailCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const payload = parseRegisterEmailInput(match?.[1] || '');

  if (!payload) {
    await bot.sendMessage(
      chatId,
      [
        'Cach dung:',
        '/regemail username password',
        '/regemail username|password',
        '/regemail username password email',
        '/regemail username|password email',
        '',
        'Vi du:',
        '/regemail user01 pass123',
        '/regemail user01|pass123 abc@sunmail.site'
      ].join('\n'),
      threadOptions(msg)
    );
    return;
  }

  await bot.sendMessage(chatId, 'Dang dang ky va xac minh email...', threadOptions(msg));

  try {
    const response = await registerEmail(payload.username, payload.password, payload.email);
    const result = normalizeRegisterEmailResponse(response);

    if (!result.success) {
      await bot.sendMessage(chatId, `<b>Dang ky email that bai</b>\n<code>${escapeHtml(result.message)}</code>`, threadOptions(msg, {
        parse_mode: 'HTML'
      }));
      return;
    }

    await bot.sendMessage(chatId, buildRegisterEmailMessage(result), threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Dang ky email that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

function parseRegisterEmailInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (raw.includes('|')) {
    const firstSpaceIndex = raw.search(/\s/);
    const credentialPart = firstSpaceIndex < 0 ? raw : raw.slice(0, firstSpaceIndex).trim();
    const email = firstSpaceIndex < 0 ? '' : raw.slice(firstSpaceIndex).trim();
    const [username, ...passwordParts] = credentialPart.split('|');
    const password = passwordParts.join('|');

    if (!username.trim() || !password.trim()) return null;
    if (email && !isEmailLike(email)) return null;

    return {
      username: username.trim(),
      password: password.trim(),
      email
    };
  }

  const args = raw.split(/\s+/).filter(Boolean);
  if (args.length < 2) return null;

  const email = args[2] || '';
  if (email && !isEmailLike(email)) return null;

  return {
    username: args[0],
    password: args[1],
    email
  };
}

function isEmailLike(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function normalizeRegisterEmailResponse(response) {
  const data = response?.data || response || {};
  const email = data.email || data.data?.email || '';
  const createdEmail = data.createdEmail || data.data?.createdEmail || '';
  const confirmedEmail = data.confirmedEmail || data.data?.confirmedEmail || '';
  const confirmed = data.confirmed ?? data.data?.confirmed;
  const hasEmail = Boolean(email || createdEmail || confirmedEmail);
  const success = (response?.success === true || data?.success === true || confirmed === true) && (confirmed !== false || hasEmail);
  const message =
    data?.message ||
    data?.data?.message ||
    response?.message ||
    (success ? 'Dang ky email thanh cong' : 'Dang ky email that bai');

  return {
    success,
    message,
    email,
    createdEmail,
    confirmedEmail,
    confirmed,
    otp: data.otp || data.data?.otp || '',
    stages: Array.isArray(data.stages) ? data.stages : Array.isArray(data.data?.stages) ? data.data.stages : []
  };
}

function buildRegisterEmailMessage(result) {
  const lines = [
    '<b>DANG KY EMAIL THANH CONG</b>',
    `Email: <code>${escapeHtml(result.email || result.confirmedEmail || result.createdEmail || '-')}</code>`,
    `Confirmed: <b>${result.confirmed ? 'true' : 'false'}</b>`
  ];

  if (result.createdEmail) {
    lines.push(`Created email: <code>${escapeHtml(result.createdEmail)}</code>`);
  }

  if (result.confirmedEmail) {
    lines.push(`Confirmed email: <code>${escapeHtml(result.confirmedEmail)}</code>`);
  }

  if (result.otp) {
    lines.push(`OTP: <code>${escapeHtml(result.otp)}</code>`);
  }

  if (result.stages.length) {
    lines.push('');
    lines.push('<b>Stages</b>');
    result.stages.slice(0, 8).forEach((stage, index) => {
      lines.push(`${index + 1}. ${escapeHtml(formatStage(stage))}`);
    });
  }

  return lines.join('\n');
}

function formatStage(stage) {
  if (typeof stage === 'string') return stage;
  if (!stage || typeof stage !== 'object') return String(stage || '');
  return stage.name || stage.stage || stage.message || JSON.stringify(stage);
}

module.exports = {
  handleRegisterEmailCommand,
  parseRegisterEmailInput
};
