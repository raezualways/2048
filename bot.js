/**
 * Telegram Bot for 2048 Game Web App
 *
 * This bot provides a simple interface to launch the 2048 game as a Telegram Web App.
 * Users can start the bot and click a button to open the game directly in Telegram.
 */

// Import required modules
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Load environment variables from .env file

// Configuration - Load from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN; // Loaded from .env file
const GAME_URL = process.env.GAME_URL; // Loaded from .env file

// For local development, you might use something like:
// const GAME_URL = 'https://your-ngrok-url.ngrok.io/2048-1.html';
// For production, use your actual domain:
// const GAME_URL = 'https://your-domain.com/2048-1.html';

// Validate environment variables
if (!TELEGRAM_BOT_TOKEN || !GAME_URL) {
    console.error('❌ Configuration Error: Missing environment variables!');
    console.error('Please create a .env file with TELEGRAM_TOKEN and GAME_URL');
    process.exit(1);
}

// Create a bot instance
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {polling: true});

// Web App button configuration
const webAppButton = {
    text: '🎮 Play 2048 Now',
    web_app: {url: GAME_URL}
};

// Start command handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Player';

    // Welcome message (HTML format for reliability)
    const welcomeMessage = `
🎮 <b>Welcome to 2048 Telegram Game!</b> 🎮

Hello, ${firstName}! 👋

This is the official Telegram bot for the <b>2048 Duel Edition</b> game.
Click the button below to launch the game directly in Telegram!

💡 <b>Features:</b>
✅ Play 2048 without leaving Telegram
✅ Beautiful themes and animations
✅ Achievements system
✅ Daily challenges
✅ Multiplayer duels

🔥 Click the button to start playing!
`;

    // Send welcome message with Web App button
    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[webAppButton]]
        }
    });
});

// Help command handler
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `
📖 <b>2048 Game Bot - Help</b>

<b>Available commands:</b>
/start - Launch the game
/help - Show this help message

<b>How to play:</b>
1. Click the "Play 2048 Now" button
2. The game will open in Telegram's web view
3. Use swipe gestures or arrow buttons to move tiles
4. Combine tiles with the same numbers to reach 2048!

<b>Need support?</b>
Contact: @your_support_channel
`;

    bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[webAppButton]]
        }
    });
});

// Error handling
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.code);
    if (error.response && error.response.body) {
        console.error('📋 Детали ошибки от Telegram:', JSON.stringify(error.response.body));
    }
});

// Bot started message
console.log('🤖 2048 Telegram Bot is running...');
console.log('🔹 Waiting for /start commands...');
console.log('✅ Configuration loaded from .env file');
console.log('📁 Bot token: ' + (TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing'));
console.log('🌐 Game URL: ' + (GAME_URL ? '✅ Set' : '❌ Missing'));
console.log('💡 Bot is ready to handle Telegram Web App requests!');
