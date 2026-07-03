const { fetchLatestOtp } = require('../services/apiClient');
const { escapeHtml } = require('../utils/formatters');
const { extractAxiosError, threadOptions } = require('../utils/botUtils');

async function handleOtpCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const username = parseOtpInput(match?.[1] || '');

  if (!username) {
    await bot.sendMessage(chatId, 'Cach dung: /otp username', threadOptions(msg));
    return;
  }

  await bot.sendMessage(chatId, 'Dang lay OTP moi nhat...', threadOptions(msg));

  try {
    const response = await fetchLatestOtp(username);
    const result = normalizeOtpResponse(response);

    if (!result.otp) {
      await bot.sendMessage(chatId, [
        '<b>Khong tim thay OTP</b>',
        `Username: <code>${escapeHtml(username)}</code>`,
        result.email ? `Email: <code>${escapeHtml(result.email)}</code>` : '',
        result.message ? `Thong bao: ${escapeHtml(result.message)}` : 'Response khong co field OTP.'
      ].filter(Boolean).join('\n'), threadOptions(msg, {
        parse_mode: 'HTML'
      }));
      return;
    }

    await bot.sendMessage(chatId, buildOtpMessage(result, username), threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  } catch (error) {
    await bot.sendMessage(chatId, `<b>Lay OTP that bai</b>\n<code>${escapeHtml(extractAxiosError(error))}</code>`, threadOptions(msg, {
      parse_mode: 'HTML'
    }));
  }
}

function parseOtpInput(input) {
  const args = String(input || '').trim().split(/\s+/).filter(Boolean);
  if (args.length !== 1) return '';
  return args[0];
}

function buildOtpMessage(response, username) {
  const data = response?.otp || response?.email || response?.message ? response : normalizeOtpResponse(response);
  const lines = [
    '<b>OTP MOI NHAT</b>',
    `Username: <code>${escapeHtml(username)}</code>`
  ];

  if (data.email) lines.push(`Email: <code>${escapeHtml(data.email)}</code>`);
  lines.push(`OTP: <code>${escapeHtml(data.otp)}</code>`);
  if (data.message) lines.push(`Thong bao: ${escapeHtml(data.message)}`);

  return lines.join('\n');
}

function normalizeOtpResponse(response) {
  const data = response?.data || response || {};
  const item = data.item || data.latest || data.record || data.data?.item || data.data?.latest || {};
  const otp =
    data.otp ||
    data.code ||
    data.otpCode ||
    data.latestOtp ||
    data.latestOTP ||
    data.data?.otp ||
    data.data?.code ||
    data.data?.otpCode ||
    data.data?.latestOtp ||
    item.otp ||
    item.code ||
    item.otpCode ||
    item.latestOtp ||
    '';
  const email =
    data.email ||
    data.data?.email ||
    data.mail ||
    data.data?.mail ||
    item.email ||
    item.mail ||
    '';
  const message = data.message || data.msg || data.data?.message || data.data?.msg || '';

  return { otp, email, message };
}

module.exports = {
  handleOtpCommand,
  parseOtpInput
};
