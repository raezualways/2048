# 2048 Telegram Bot 🎮

A Telegram bot that launches the 2048 game as a Web App directly in Telegram.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your bot token:**
   - Create a `.env` file in the `tg-bot` directory
   - Add your Telegram bot token from @BotFather:
     ```
     TELEGRAM_BOT_TOKEN=your_bot_token_here
     GAME_URL=https://your-game-url.com/2048-1.html
     ```

3. **Run the bot:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## 📋 Requirements

- Node.js v14+
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- Your game must be hosted on HTTPS (for production)
- For local testing, use [Ngrok](https://ngrok.com/) or [Localtunnel](https://localtunnel.github.io/www/)

## 🤖 Bot Features

- `/start` - Shows welcome message with Web App button
- `/help` - Shows help information
- Web App button that opens the 2048 game directly in Telegram

## 🔧 Configuration

Edit the following variables in `bot.js`:

```javascript
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const GAME_URL = 'YOUR_GAME_URL_HERE';
```

For local testing:
```javascript
// Example with Ngrok:
const GAME_URL = 'https://your-ngrok-url.ngrok.io/2048-1.html';
```

For production:
```javascript
// Example with your domain:
const GAME_URL = 'https://your-domain.com/2048-1.html';
```

## 📦 Dependencies

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API wrapper
- [dotenv](https://github.com/motdotla/dotenv) - Environment variables management

## 🎯 Telegram Web App Setup

1. Make sure your game is properly configured as a Telegram Web App
2. The game should include the Telegram Web App script:
   ```html
   <script src="https://telegram.org/js/telegram-web-app.js"></script>
   ```
3. Set up proper web app initialization in your game's JavaScript

## 📝 License

MIT License - feel free to use and modify!
