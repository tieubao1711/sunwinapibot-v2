# Minimal Telegram Account Bot

Node.js Telegram bot dung `node-telegram-bot-api`, chay polling va giu cac lenh: `/info`, `/history`, `/changepass`, `/forgotpass`, `/regemail`, `/verifyemail`, `/otp`, `/ruttien`.

## Cai dat

```bash
npm install
```

Tao file `.env` tu mau:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
API_BASE_URL=http://localhost:3000
HISTORY_API_BASE_URL=http://localhost:3001
WITHDRAW_API_BASE_URL=http://localhost:4587
EMAIL_LOOKUP_BASE_URL=http://103.82.23.27:5001
OTP_API_PATH=/login/latest-otp
WITHDRAW_PROXY_POOL_ID=
WITHDRAW_PROXY_ID=
WITHDRAW_FORCE_RELOAD_PROXY=false
REQUEST_TIMEOUT_MS=30000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
```

Bot khong tra loi trong private chat. Admin phai dang nhap trong group bang tai khoan/mat khau da cau hinh trong `.env`, sau do set group/topic bot duoc phep hoat dong.

Trong group, neu muon go lenh khong can tag bot, vao BotFather va `/setprivacy` thanh `Disable`. Neu privacy dang bat, hay dung lenh kem bot username, vi du `/history@BotUsername username|password`.

## Chay bot

```bash
npm start
```

Che do dev:

```bash
npm run dev
```

Kiem tra cu phap:

```bash
npm run check
```

## Lenh nguoi dung

Bot chi tra loi trong group/topic da duoc admin set. Trong group co the goi lenh kem suffix bot username, vi du `/info@BotUsername`.

```text
/id

/info username password
/info username|password

/history username password
/history username|password

/changepass username oldPassword newPassword
/changepass username|oldPassword newPassword

/forgotpass username newPassword
/forgotpass username email newPassword

/regemail username password
/regemail username|password
/regemail username password email
/regemail username|password email

/verifyemail username password
/verifyemail username|password
/verifyemail username password email otp
/verifyemail username|password email otp

/otp username

/ruttien accessToken amount
/ruttien username password amount
/ruttien username|password amount
```

`/start` va `/help` hien thi huong dan ngan gon cho 3 lenh tren.

## Lenh admin

Chay trong group, khong chay private:

```text
/adminlogin username password
/setgroup
/setgroup -1001234567890
/settopic
/settopic 123
/adminstatus
```

`/setgroup` khong co tham so se lay group hien tai. `/settopic` khong co tham so se lay topic hien tai qua `message_thread_id`.

Cau hinh group/topic duoc luu o `data/admin-config.json` khi bot dang chay.

## API dang dung

Bot su dung `API_BASE_URL` cho info/change password va `HISTORY_API_BASE_URL` cho history. Neu khong set `HISTORY_API_BASE_URL`, bot se fallback ve `API_BASE_URL`.

- `POST /account/info` voi body `{ username, password }`
- `GET /central-login-results/latest` voi query `{ username, password }`
- `POST /login/change-password` voi body `{ username, password, newPassword }`
- `POST /login/forgot-password` tren `WITHDRAW_API_BASE_URL` voi body `{ username, newPassword, email? }`
- `POST /login/register-email` tren `WITHDRAW_API_BASE_URL` voi body `{ username, password, email? }`
- `POST /login/verify-email` tren `WITHDRAW_API_BASE_URL` voi body `{ username, password, email?, otp? }`
- `POST ${OTP_API_PATH}` tren `WITHDRAW_API_BASE_URL` voi body `{ username }`
- `POST /withdraw/token` tren `WITHDRAW_API_BASE_URL` voi body `{ accessToken, amount }`
- `POST /withdraw` tren `WITHDRAW_API_BASE_URL` voi body `{ username, password, amount }`
