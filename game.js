// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
}

let tsX = null;
let tsY = null;
const state = { grid: Array(4).fill(null).map(() => Array(4).fill(null)), score: 0 };

function render() {
    const container = document.getElementById('tileContainer');
    // Логика отрисовки плиток (добавь создание div с классом .tile)
    document.getElementById('score').textContent = state.score;
}

// Обработка касаний
window.addEventListener('touchstart', e => {
    e.preventDefault();
    tsX = e.touches[0].clientX;
    tsY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('touchend', e => {
    if (tsX === null || tsY === null) return;
    let dx = e.changedTouches[0].clientX - tsX;
    let dy = e.changedTouches[0].clientY - tsY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) {
        // Здесь вызов твоей функции move()
        console.log("Move:", Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        // triggerHaptic(); // Вызов вибрации
    }
    tsX = null; tsY = null;
}, { passive: false });

// Вибрация (Haptic)
function triggerHaptic() {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
}
