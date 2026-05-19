function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatNumber(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num.toLocaleString('vi-VN') : '0';
}

function formatDateTime(value) {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Saigon',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getWallet(payload) {
  return (
    payload?.walletInfo?.wallet ||
    payload?.walletInfo?.wallet?.wallet ||
    payload?.walletInfo?.walletInfo?.wallet ||
    payload?.walletInfo?.wsMeta?.As ||
    payload?.wallet ||
    {}
  );
}

function buildBasicInfoMessage(payload) {
  const profile = payload?.profile || payload?.account || payload?.user || {};
  const wallet = getWallet(payload);
  const username = profile.username || payload?.username || '';

  return [
    '<b>THONG TIN TAI KHOAN</b>',
    `Username: <code>${escapeHtml(username || '-')}</code>`,
    `Display name: ${escapeHtml(profile.displayName || profile.nickname || profile.name || '-')}`,
    `Phone: <code>${escapeHtml(profile.phone || '-')}</code>`,
    `Email: <code>${escapeHtml(profile.email || '-')}</code>`,
    '',
    '<b>SO DU</b>',
    `Gold: <b>${formatNumber(wallet.gold)}</b>`,
    `Chip: <b>${formatNumber(wallet.chip)}</b>`,
    `Safe: <b>${formatNumber(wallet.safe)}</b>`,
    `VIP: <b>${formatNumber(wallet.vip)}</b>`
  ].join('\n');
}

function buildHistoryMessage(item) {
  const deposits = Array.isArray(item?.deposits) ? item.deposits : [];
  const withdraws = Array.isArray(item?.withdraws) ? item.withdraws : [];

  const lines = [
    '<b>LICH SU TAI KHOAN</b>',
    `<code>${escapeHtml(item?.username || '-')}</code> - <b>${escapeHtml(item?.displayName || '-')}</b>`,
    `Phone: <code>${escapeHtml(item?.phone || '-')}</code>`,
    `So du: <b>${formatNumber(item?.balance)}</b>`,
    '',
    `<b>Nap:</b> ${formatNumber(item?.totalDeposit)} (${formatNumber(item?.depositCount)} lenh)`,
    `<b>Rut:</b> ${formatNumber(item?.totalWithdraw)} (${formatNumber(item?.withdrawCount)} lenh)`,
    `<b>Cap nhat:</b> ${escapeHtml(formatDateTime(item?.checkedAt || item?.updatedAt || item?.createdAt))}`,
    '',
    '<b>NAP GAN NHAT</b>'
  ];

  if (!deposits.length) {
    lines.push('Khong co du lieu nap.');
  } else {
    deposits.slice(0, 5).forEach((deposit, index) => {
      lines.push(`${index + 1}. <b>${formatNumber(deposit.amount)}</b> - ${escapeHtml(deposit.statusDescription || '-')}`);
      if (deposit.requestTime) {
        lines.push(`Thoi gian: ${escapeHtml(formatDateTime(deposit.requestTime))}`);
      }
    });
  }

  lines.push('', '<b>RUT GAN NHAT</b>');

  if (!withdraws.length) {
    lines.push('Khong co du lieu rut.');
  } else {
    withdraws.slice(0, 5).forEach((withdraw, index) => {
      const bankReceive = withdraw.bankReceive || {};
      lines.push('');
      lines.push(`${index + 1}. <b>${formatNumber(withdraw.amount)}</b> - ${escapeHtml(withdraw.statusDescription || '-')}`);
      lines.push(`Ma GD: <code>${escapeHtml(withdraw.transactionCode || withdraw.id || '-')}</code>`);
      lines.push(`Thoi gian: ${escapeHtml(formatDateTime(withdraw.requestTime))}`);
      lines.push(`Nhan: ${escapeHtml(bankReceive.accountName || '-')} - <code>${escapeHtml(bankReceive.accountNumber || '-')}</code>`);
    });
  }

  return lines.join('\n');
}

module.exports = {
  buildBasicInfoMessage,
  buildHistoryMessage,
  escapeHtml,
  formatDateTime,
  formatNumber
};
