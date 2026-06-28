const axios = require('axios');
const env = require('../config/env');

const client = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json'
  }
});

const historyClient = axios.create({
  baseURL: env.historyApiBaseUrl,
  timeout: env.requestTimeoutMs
});

const withdrawClient = axios.create({
  baseURL: env.withdrawApiBaseUrl,
  timeout: env.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function fetchAccountInfo(username, password) {
  const { data } = await client.post('/account/info', { username, password });
  return data;
}

async function fetchLatestHistory(username, password) {
  const { data } = await historyClient.get('/central-login-results-2/latest', {
    params: { username, password }
  });
  return data;
}

async function changePasswordByLogin(username, password, newPassword) {
  const { data } = await client.post('/login/change-password', {
    username,
    password,
    newPassword
  });
  return data;
}

async function createWithdrawalByToken(accessToken, amount) {
  const payload = {
    accessToken,
    amount
  };

  if (env.withdrawProxyPoolId) {
    payload.proxyPoolId = env.withdrawProxyPoolId;
    payload.proxyId = env.withdrawProxyId;
    payload.forceReloadProxy = env.withdrawForceReloadProxy;
  }

  const { data } = await withdrawClient.post('/withdraw/token', payload);
  return data;
}

async function createWithdrawal(username, password, amount) {
  const payload = {
    username,
    password,
    amount
  };

  if (env.withdrawProxyPoolId) {
    payload.proxyPoolId = env.withdrawProxyPoolId;
    payload.proxyId = env.withdrawProxyId;
    payload.forceReloadProxy = env.withdrawForceReloadProxy;
  }

  const { data } = await withdrawClient.post('/withdraw', payload);
  return data;
}

module.exports = {
  changePasswordByLogin,
  createWithdrawal,
  createWithdrawalByToken,
  fetchAccountInfo,
  fetchLatestHistory
};
