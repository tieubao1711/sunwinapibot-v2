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

module.exports = {
  changePasswordByLogin,
  fetchAccountInfo,
  fetchLatestHistory
};
