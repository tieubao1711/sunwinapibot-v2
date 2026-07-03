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
    await bot.sendMessage(chatId, buildOtpMessage(response, username), threadOptions(msg, {
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
  const data = response?.data || response || {};
  const otp =
    data.otp ||
    data.code ||
    data.latestOtp ||
    data.latestOTP ||
    data.data?.otp ||
    data.data?.code ||
    data.data?.latestOtp ||
    '';
  const email = data.email || data.data?.email || data.mail || data.data?.mail || '';
  const message = data.message || data.msg || data.data?.message || '';

  const lines = [
    '<b>OTP MOI NHAT</b>',
    `Username: <code>${escapeHtml(username)}</code>`
  ];

  if (email) lines.push(`Email: <code>${escapeHtml(email)}</code>`);
  lines.push(`OTP: <code>${escapeHtml(otp || '-')}</code>`);
  if (message) lines.push(`Thong bao: ${escapeHtml(message)}`);

  return lines.join('\n');
}

module.exports = {
  handleOtpCommand,
  parseOtpInput
};
