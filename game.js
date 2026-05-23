let tsX = null;
let tsY = null;

// 1. Начало свайпа
window.addEventListener('touchstart', e => {
    tsX = e.touches[0].clientX;
    tsY = e.touches[0].clientY;
}, { passive: false });

// 2. Конец свайпа
window.addEventListener('touchend', e => {
    if (tsX === null || tsY === null) return;

    let dx = e.changedTouches[0].clientX - tsX;
    let dy = e.changedTouches[0].clientY - tsY;

    // Порог срабатывания 40px
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) {
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
    }

    tsX = null;
    tsY = null;
}, { passive: false });

// 3. Инициализация Telegram (разворот)
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    // Попробуй этот метод, если он есть в версии API
    if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes();
    }
}
