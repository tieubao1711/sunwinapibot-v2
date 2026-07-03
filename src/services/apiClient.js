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

const emailLookupClient = axios.create({
  baseURL: env.emailLookupBaseUrl,
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

async function forgotPassword(username, email, newPassword) {
  const payload = {
    username,
    newPassword
  };

  if (email) payload.email = email;

  const { data } = await withdrawClient.post('/login/forgot-password', payload);
  return data;
}

async function fetchEmailByUsername(username) {
  const { data } = await emailLookupClient.get('/email/by-username', {
    params: { username }
  });
  return data;
}

async function registerEmail(username, password, email = '') {
  const payload = {
    username,
    password
  };

  if (email) payload.email = email;

  const { data } = await withdrawClient.post('/login/register-email', payload);
  return data;
}

async function verifyEmail(username, password, email = '', otp = '') {
  const payload = {
    username,
    password
  };

  if (email) payload.email = email;
  if (otp) payload.otp = otp;

  const { data } = await withdrawClient.post('/login/verify-email', payload);
  return data;
}

async function fetchLatestOtp(username) {
  const errors = [];

  if (env.otpApiPath) {
    try {
      const { data } = await withdrawClient.post(env.otpApiPath, { username });
      return data;
    } catch (error) {
      errors.push(error);
      if (!isNotFoundRoute(error)) throw error;
    }
  }

  const fallbacks = [
    () => emailLookupClient.get('/email/by-username', { params: { username } }),
    () => emailLookupClient.get('/email/latest-otp', { params: { username } }),
    () => emailLookupClient.post('/email/latest-otp', { username }),
    () => emailLookupClient.get('/otp/by-username', { params: { username } }),
    () => emailLookupClient.post('/otp/by-username', { username })
  ];

  for (const request of fallbacks) {
    try {
      const { data } = await request();
      return data;
    } catch (error) {
      errors.push(error);
      if (!isNotFoundRoute(error)) throw error;
    }
  }

  throw errors[0] || new Error('Khong tim thay endpoint lay OTP.');
}

function isNotFoundRoute(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const text = typeof data === 'string' ? data : JSON.stringify(data || '');
  return status === 404 || /Cannot\s+(GET|POST)/i.test(text);
}

module.exports = {
  changePasswordByLogin,
  createWithdrawal,
  createWithdrawalByToken,
  fetchAccountInfo,
  fetchLatestHistory,
  fetchLatestOtp,
  fetchEmailByUsername,
  forgotPassword,
  registerEmail,
  verifyEmail
};
