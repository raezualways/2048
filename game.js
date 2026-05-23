const state = {
    grid: Array(4).fill(null).map(() => Array(4).fill(null)),
    score: 0,
    isLocked: false,
    history: [],
    nextId: 1
};

// Рендерер: используем DOM Pool (не пересоздаем все элементы!)
function render() {
    const container = document.getElementById('tileContainer');
    const existing = new Set(Array.from(container.children).map(el => parseInt(el.dataset.id)));
    const active = new Set();

    state.grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (!cell) return;
            active.add(cell.id);
            let el = document.querySelector(`[data-id="${cell.id}"]`);
            if (!el) {
                el = document.createElement('div');
                el.className = 'tile';
                el.dataset.id = cell.id;
                container.appendChild(el);
            }
            el.textContent = cell.value;
            el.className = `tile v${cell.value}`;
            el.style.transform = `translate(${x * 85}px, ${y * 85}px)`;
        });
    });

    // Удаляем лишнее
    Array.from(container.children).forEach(el => {
        if (!active.has(parseInt(el.dataset.id))) el.remove();
    });
}

function move(dir) {
    if (state.isLocked) return;
    state.isLocked = true;
    
    // Здесь твоя логика сдвига (slideRow / merge)
    // ... после обработки:
    render();
    
    setTimeout(() => { state.isLocked = false; }, 150);
}

// Управление касаниями (исправленный touch)
let tsX, tsY;
window.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; tsY = e.touches[0].clientY; });
window.addEventListener('touchend', e => {
    if (!tsX) return;
    let dx = e.changedTouches[0].clientX - tsX;
    let dy = e.changedTouches[0].clientY - tsY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
    tsX = null;
});
