/**
 * Telegram Bot for 2048 Game Web App
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); 

// FIX 1: Поддерживаем оба варианта названия переменной из .env и .env.example
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const GAME_URL = process.env.GAME_URL;

// FIX 2: Умная валидация конфига перед запуском
if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.includes('вставь_сюда') || TELEGRAM_BOT_TOKEN === 'your_bot_token_here') {
    console.error('❌ Ошибка конфигурации: Токен бота отсутствует или содержит заглушку!');
    console.error('Пожалуйста, создайте файл .env и укажите реальный токен от @BotFather.');
    process.exit(1);
}

if (!GAME_URL || GAME_URL.includes('вставь_сюда') || GAME_URL.includes('your-game-url')) {
    console.error('❌ Ошибка конфигурации: URL игры отсутствует или содержит заглушку!');
    console.error('Пожалуйста, укажите валидный адрес игры в переменной GAME_URL внутри .env');
    process.exit(1);
}

// Проверка протокола безопасности (Telegram Web Apps строго требуют HTTPS)
if (!GAME_URL.startsWith('https://')) {
    console.warn('⚠️  ВНИМАНИЕ: GAME_URL должен начинаться с https://');
    console.warn('Если вы тестируете локально, используйте Ngrok/Localtunnel. Обычный http:// Telegram заблокирует.');
}

// Инициализация бота
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Конфигурация инлайн-кнопки для запуска Web App
const webAppButton = {
    text: '🎮 Play 2048 Now',
    web_app: { url: GAME_URL }
};

// Хэндлер команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🎮 <b>Добро пожаловать в 2048 Duel Edition!</b>

Нажмите кнопку ниже, чтобы запустить игру прямо внутри Telegram.
`;

    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[webAppButton]]
        }
    }).catch((error) => {
        // FIX 3: Выводим ошибку, если Telegram отклонил кнопку (например, из-за неверного URL)
        console.error('❌ Ошибка при обработке /start:', error.message);
        if (error.message.includes('WEB_APP_URL_INVALID')) {
            console.error('👉 Критическая ошибка: Указанный GAME_URL некорректен или не поддерживается Telegram Bot API.');
        }
    });
});

// Хэндлер команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 <b>2048 Game Bot - Help</b>

<b>Available commands:</b>
/start - Launch the game
/help - Show this help message

<b>How to play:</b>
1. Click the "Play 2048 Now" button
2. Use swipe gestures to move tiles
3. Combine tiles with the same numbers to reach 2048!
`;

    bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[webAppButton]]
        }
    }).catch((error) => {
        console.error('❌ Ошибка при обработке /help:', error.message);
    });
});

// Глобальный перехват ошибок соединения
bot.on('polling_error', (error) => {
    console.error('❌ Поллинг-ошибка бота:', error.code || error.message);
    if (error.response && error.response.body) {
        console.error('📋 Детали от сервера Telegram:', JSON.stringify(error.response.body));
    }
});

console.log('🚀 Бот успешно запущен и готов к работе!');
