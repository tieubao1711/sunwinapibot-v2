function commandRegex(command, withArgs = true) {
  const suffix = '(?:@\\w+)?';
  const args = withArgs ? '(?:\\s+(.+))?' : '';
  return new RegExp(`^/${command}${suffix}${args}$`, 'i');
}

function getSessionKey(chatId, userId) {
  return `${chatId}:${userId}`;
}

function extractAxiosError(error) {
  const data = error?.response?.data;

  if (typeof data === 'string') {
    return extractHtmlPreText(data) || data;
  }

  return (
    data?.message ||
    data?.error ||
    data?.data?.message ||
    error?.message ||
    'Da xay ra loi khong xac dinh'
  );
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
    '<code>/info username password</code>',
    '<code>/info username|password</code>',
    '',
    '<code>/history username password</code>',
    '<code>/history username|password</code>',
    '',
    '<code>/changepass username oldPassword newPassword</code>',
    '<code>/changepass username|oldPassword newPassword</code>'
  ].join('\n');
}

module.exports = {
  commandRegex,
  extractAxiosError,
  getSessionKey,
  helpMessage,
  parseCredentials,
  threadOptions
};
