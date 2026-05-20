# Minimal Telegram Account Bot

Node.js Telegram bot dung `node-telegram-bot-api`, chay polling va chi giu 3 nhom lenh: `/info`, `/history`, `/changepass`.

## Cai dat

```bash
npm install
```

Tao file `.env` tu mau:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
API_BASE_URL=http://localhost:3000
HISTORY_API_BASE_URL=http://localhost:3001
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
/info username password
/info username|password

/history username password
/history username|password

/changepass username oldPassword newPassword
/changepass username|oldPassword newPassword
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
