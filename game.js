// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
    // Попробуй этот метод: он отключает скролл, но не "убивает" касания
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
}
setTimeout(() => {
    if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes(); 
        
const container = document.getElementById('tileContainer');
let tsX = null;
let tsY = null;

// Обработка касаний ТОЛЬКО внутри игрового поля
container.addEventListener('touchstart', (e) => {
    // Не вешаем preventDefault здесь, это может заблокировать отрисовку
    tsX = e.touches[0].clientX;
    tsY = e.touches[0].clientY;
}, { passive: true }); // passive: true - чтобы не тормозить интерфейс

container.addEventListener('touchend', (e) => {
    if (tsX === null || tsY === null) return;
    
    let dx = e.changedTouches[0].clientX - tsX;
    let dy = e.changedTouches[0].clientY - tsY;

    // Порог 40px
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) {
        // Здесь твоя логика move()
        const direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        console.log("Move:", direction);
        
        // Вибрация
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    }
    
    tsX = null; 
    tsY = null;
}, { passive: false });
