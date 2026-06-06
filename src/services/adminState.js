const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'data', 'admin-config.json');
const adminSessions = new Set();

let groupConfig = loadGroupConfig();

function loadGroupConfig() {
  try {
    if (!fs.existsSync(configPath)) return {};
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return normalizeConfig(parsed);
  } catch (error) {
    console.error('Failed to load admin config:', error?.message || error);
    return {};
  }
}

function saveGroupConfig(nextConfig) {
  groupConfig = normalizeConfig(nextConfig);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `${JSON.stringify(groupConfig, null, 2)}\n`);
  return groupConfig;
}

function normalizeConfig(config) {
  const groupId = normalizeId(config?.groupId);
  const topicId = normalizeId(config?.topicId);
  return {
    ...(groupId ? { groupId } : {}),
    ...(topicId ? { topicId } : {})
  };
}

function normalizeId(value) {
  if (value === undefined || value === null || value === '') return '';
  const text = String(value).trim();
  return /^-?\d+$/.test(text) ? text : '';
}

function loginAdmin(userId) {
  adminSessions.add(String(userId));
}

function isAdminLoggedIn(userId) {
  return adminSessions.has(String(userId));
}

function getGroupConfig() {
  return { ...groupConfig };
}

function setGroupId(groupId) {
  const normalizedGroupId = normalizeId(groupId);
  if (!normalizedGroupId) return getGroupConfig();
  const groupChanged = groupConfig.groupId && groupConfig.groupId !== normalizedGroupId;

  return saveGroupConfig({
    ...groupConfig,
    groupId: normalizedGroupId,
    ...(groupChanged ? { topicId: '' } : {})
  });
}

function setTopicId(topicId) {
  const normalizedTopicId = normalizeId(topicId);
  if (!normalizedTopicId) return getGroupConfig();

  return saveGroupConfig({
    ...groupConfig,
    topicId: normalizedTopicId
  });
}

function isGroupChat(msg) {
  return msg?.chat?.type === 'group' || msg?.chat?.type === 'supergroup';
}

function isConfiguredGroup(msg) {
  const config = getGroupConfig();
  return Boolean(config.groupId) && String(msg?.chat?.id) === config.groupId;
}

function isConfiguredTopic(msg) {
  const config = getGroupConfig();
  if (!config.topicId) return true;
  return String(msg?.message_thread_id || '') === config.topicId;
}

function shouldHandleUserCommand(msg) {
  return isGroupChat(msg) && isConfiguredGroup(msg) && isConfiguredTopic(msg);
}

function shouldHandleAdminCommand(msg) {
  return isGroupChat(msg);
}

function getUserCommandBlockReason(msg) {
  const config = getGroupConfig();

  if (!isGroupChat(msg)) {
    return 'Bot chi hoat dong trong group, khong tra loi private chat.';
  }

  if (!config.groupId) {
    return 'Bot chua duoc set group. Admin can dung /adminlogin roi /setgroup trong group nay.';
  }

  if (String(msg?.chat?.id) !== config.groupId) {
    return `Group nay khong co quyen dung bot. Group da set: ${config.groupId}. Group hien tai: ${msg?.chat?.id}.`;
  }

  if (config.topicId && String(msg?.message_thread_id || '') !== config.topicId) {
    return `Sai topic. Topic da set: ${config.topicId}. Topic hien tai: ${msg?.message_thread_id || 'khong co topic id'}.`;
  }

  return '';
}

function getAdminCommandBlockReason(msg) {
  if (!isGroupChat(msg)) {
    return 'Lenh admin chi dung trong group, khong dung private chat.';
  }

  return '';
}

module.exports = {
  getAdminCommandBlockReason,
  getGroupConfig,
  getUserCommandBlockReason,
  isAdminLoggedIn,
  isGroupChat,
  loginAdmin,
  setGroupId,
  setTopicId,
  shouldHandleAdminCommand,
  shouldHandleUserCommand
};
