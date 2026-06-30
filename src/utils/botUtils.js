function commandRegex(command, withArgs = true) {
  const suffix = '(?:@\\w+)?';
  const args = withArgs ? '(?:\\s+([\\s\\S]+?))?' : '';
  return new RegExp(`^/${command}${suffix}${args}\\s*$`, 'i');
}

function parseBotCommand(text) {
  const match = String(text || '').trim().match(/^\/([a-z0-9_]+)(?:@([a-z0-9_]+))?(?:\s+([\s\S]*))?$/i);
  if (!match) return null;
  return {
    command: match[1].toLowerCase(),
    targetBot: match[2] ? match[2].toLowerCase() : '',
    args: match[3] || ''
  };
}

function isCommandForThisBot(msg, botUsername) {
  const parsed = parseBotCommand(msg?.text);
  if (!parsed) return false;
  if (!parsed.targetBot) return true;
  if (!botUsername) return true;
  return parsed.targetBot === String(botUsername).toLowerCase();
}

function getSessionKey(chatId, userId) {
  return `${chatId}:${userId}`;
}

function extractAxiosError(error) {
  const data = error?.response?.data;
  const detail = extractResponseMessage(data);

  if (detail) return detail;

  return (
    error?.message ||
    'Da xay ra loi khong xac dinh'
  );
}

function extractResponseMessage(value) {
  if (value === undefined || value === null) return '';

  if (typeof value === 'string') {
    return extractHtmlPreText(value) || value;
  }

  if (Array.isArray(value)) {
    return value.map(extractResponseMessage).filter(Boolean).join('\n');
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  const direct =
    value.message ||
    value.msg ||
    value.error ||
    value.reason ||
    value.detail ||
    value.data?.message ||
    value.data?.msg ||
    value.data?.error ||
    value.data?.data?.message ||
    value.data?.data?.msg ||
    value.data?.data?.error;

  if (direct) return extractResponseMessage(direct);

  try {
    return JSON.stringify(value);
  } catch (error) {
    return '';
  }
}

function extractHtmlPreText(value) {
  const match = String(value || '').match(/<pre>([\s\S]*?)<\/pre>/i);
  if (!match) return '';
  return match[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseCredentials(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  if (raw.includes('|')) {
    const [username, ...passwordParts] = raw.split('|');
    const password = passwordParts.join('|');
    if (!username.trim() || !password.trim()) return null;
    return { username: username.trim(), password: password.trim() };
  }

  const args = raw.split(/\s+/).filter(Boolean);
  if (args.length < 2) return null;

  return {
    username: args[0],
    password: args.slice(1).join(' ')
  };
}

function threadOptions(msg, options = {}) {
  if (!msg?.message_thread_id) return options;
  return {
    ...options,
    message_thread_id: msg.message_thread_id
  };
}

function helpMessage() {
  return [
    '<b>Huong dan su dung</b>',
    '',
    '<code>/id</code>',
    '',
    '<code>/info username password</code>',
    '<code>/info username|password</code>',
    '',
    '<code>/history username password</code>',
    '<code>/history username|password</code>',
    '',
    '<code>/changepass username oldPassword newPassword</code>',
    '<code>/changepass username|oldPassword newPassword</code>',
    '',
    '<code>/ruttien accessToken amount</code>',
    '<code>/ruttien username password amount</code>',
    '<code>/ruttien username|password amount</code>'
  ].join('\n');
}

module.exports = {
  commandRegex,
  extractAxiosError,
  extractResponseMessage,
  getSessionKey,
  helpMessage,
  isCommandForThisBot,
  parseBotCommand,
  parseCredentials,
  threadOptions
};
