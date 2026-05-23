const state = {
    grid: Array(4).fill(null).map(() => Array(4).fill(null)),
    score: 0,
    isLocked: false,
    nextId: 1
};

function render() {
    const container = document.getElementById('tileContainer');
    const activeIds = new Set();
    
    state.grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (!cell) return;
            activeIds.add(cell.id);
            let el = document.querySelector(`[data-id="${cell.id}"]`);
            if (!el) {
                el = document.createElement('div');
                el.className = 'tile';
                el.dataset.id = cell.id;
                container.appendChild(el);
            }
            el.className = `tile v${cell.value}`;
            el.style.transform = `translate(${x * 80 + 10}px, ${y * 80 + 10}px)`;
            el.textContent = cell.value;
        });
    });

    Array.from(container.children).forEach(el => {
        if (!activeIds.has(parseInt(el.dataset.id))) el.remove();
    });
}

// Логика инициализации и свайпов (сокращенно)
function init() {
    // Добавь сюда логику создания первых двух плиток
    render();
}

window.addEventListener('load', init);
// Добавь опцию passive: false, чтобы можно было отменить жест
window.addEventListener('touchmove', function(e) {
    // Если свайп происходит внутри игрового поля
    if (e.target.closest('#tileContainer')) {
        e.preventDefault(); // Отменяем системное сворачивание
    }
}, { passive: false });

// И в твоем существующем touchend добавь preventDefault тоже
window.addEventListener('touchend', e => {
    if (!tsX) return;
    
    // Предотвращаем стандартное поведение
    e.preventDefault(); 
    
    let dx = e.changedTouches[0].clientX - tsX;
    let dy = e.changedTouches[0].clientY - tsY;
    
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) {
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
    }
    tsX = null;
}, { passive: false });
