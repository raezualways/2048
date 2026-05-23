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
