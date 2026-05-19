const axios = require('axios');
const env = require('../config/env');

const client = axios.create({
  baseURL: env.apiBaseUrl,
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
  const { data } = await client.get('/central-login-results/latest', {
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
