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

  return saveGroupConfig({
    ...groupConfig,
    groupId: normalizedGroupId
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
  const config = getGroupConfig();
  if (!isGroupChat(msg)) return false;
  if (!config.groupId) return true;
  return String(msg?.chat?.id) === config.groupId;
}

module.exports = {
  getGroupConfig,
  isAdminLoggedIn,
  isGroupChat,
  loginAdmin,
  setGroupId,
  setTopicId,
  shouldHandleAdminCommand,
  shouldHandleUserCommand
};
