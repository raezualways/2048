document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) return; // Разрешаем зум, если нужно
    e.preventDefault();
}, { passive: false });
if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
  navigator.serviceWorker.register('./sw.js');
});
}
// ==========================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И НАСТРОЙКИ ИГРЫ
// ==========================================
let size = 4;
let scoreV = 0;
let bestV = 0;
let g = [];
let historyStack = [];
let idCounter = 1;
let gameOver = false;
let winShown = false;
let currentSeed = null;
let movesLog = [];
let rivalScore = null;
let totalMovesCount = 0;
let isTimerRunning = false;
let timerIntervalId = null;
let currentRng = null;
let gameTime = 0;
let gameStarted = false; // FIX 2: Флаг для корректного учета сыгранных игр
let recordBrokenThisRun = false; // FIX: Флаг для отслеживания нового рекорда в текущей сессии

let comboMultiplier = 1;
let nextTileValue = 2;
let currentBattleId = null;

let stats = { gamesPlayed: 0, wins: 0, totalScore: 0, bestTile: 0 };

// Базовая конфигурация ачивок (защищена от стирания)
const achievements = {
    firstMove: { name:'Первый пошел!', desc:'Сделать самый первый ход в партии', icon:'👣', earned:false },
    score1000: { name:'Первая тысяча', desc:'Набрать 1,000 очков', icon:'💯', earned:false },
    score5000: { name:'Крепкий середняк', desc:'Набрать 5,000 очков', icon:'📈', earned:false },
    score10000: { name:'Мастер счета', desc:'Набрать 10,000 очков', icon:'🔥', earned:false },
    score50000: { name:'Абсолютный рекорд', desc:'Набрать безумные 50,000 очков', icon:'🌌', earned:false },
    tile64: { name:'Малый шаг', desc:'Собрать плитку 64', icon:'🎲', earned:false },
    tile256: { name:'Эпоха 256', desc:'Собрать плитку 256', icon:'🧱', earned:false },
    tile512: { name:'Половина пути', desc:'Собрать плитку 512', icon:'🌗', earned:false },
    tile1024: { name:'Близко к цели', desc:'Собрать плитку 1024', icon:'💎', earned:false },
    tile2048: { name:'Абсолютная победа', desc:'Собрать заветные 2048', icon:'👑', earned:false },
    speedrun: { name:'Спидраннер', desc:'Набрать 2048 очков меньше чем за 5 минут', icon:'⚡', earned:false },
    tactician: { name:'Тактик', desc:'Сделать более 500 ходов за одну партию', icon:'🧠', earned:false },
    giantBoard: { name:'Гигантомания', desc:'Сыграть на поле 6х6', icon:'🗺️', earned:false },
    smallBoard: { name:'Стандарт', desc:'Сыграть на классическом поле 4х4', icon:'📐', earned:false },
    timeTraveler: { name:'Эффект бабочки', desc:'Исправить ошибку с помощью отмены хода', icon:'⏳', earned:false },
    closeCall: { name:'На волоске', desc:'Заполнить поле так, что осталось лишь 2 клетки', icon:'🚨', earned:false },
    dailyDone: { name:'Утренний кофе', desc:'Бросить вызов Ежедневному испытанию', icon:'📅', earned:false },
    marathon: { name:'Марафонец', desc:'Провести в одной партии более 5 минут', icon:'🏃', earned:false },
    cleanSlate: { name:'Чистый лист', desc:'Перезапустить начатую игру кнопкой сброса', icon:'🔄', earned:false },
    lucky77: { name:'Красивое число', desc:'Сделать ровно 77 ходов за партию', icon:'🎰', earned:false },
    hoarder: { name:'Перфекционист', desc:'Открыть новое меню достижений', icon:'🏅', earned:false }
};

const botNames = [
    { name: "Ваня228", score: null },
    { name: "Алексей", score: null },
    { name: "Матрица", score: null },
    { name: "Квант", score: null },
    { name: "Лёха", score: null },
    { name: "Везунчик", score: null },
    { name: "Альфа", score: null },
    { name: "ГлубокийУм", score: null },
    { name: "Пиксель", score: null },
    { name: "Призрак", score: null }
];

const fixedLeaders = [
    { name: "MioMuura", score: 13012 },
    { name: "Ulvi", score: 5620 },
    { name: "raezu", score: 10034 }
];

(function injectStyles() {
    const id = 'game-achievements-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
        #board, .menu-modal, .cell, button {
            touch-action: none;
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        .tile {
            will-change: transform; /* FIX 6: Оптимизация слоев рендеринга для GPU мобилок */
        }
        @keyframes boardShake {
            0%, 100% { transform: translate(0, 0); }
            10%, 30%, 50%, 70%, 90% { transform: translate(-6px, 4px) rotate(-0.5deg); }
            20%, 40%, 60%, 80% { transform: translate(6px, -4px) rotate(0.5deg); }
        }
        .shake-board { animation: boardShake 0.3s ease-in-out; }
        .tile-shatter-fx { transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.7s ease-out !important; }

        .ach-menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
            gap: 8px;
            max-height: 320px;
            overflow-y: auto;
            padding-right: 4px;
            margin-top: 12px;
            touch-action: pan-y !important;
            -webkit-overflow-scrolling: touch;
        }
        .ach-item-card {
            background: var(--empty, rgba(255, 255, 255, 0.05));
            border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
            border-radius: 12px;
            padding: 10px 4px;
            text-align: center;
            transition: all 0.25s ease;
            opacity: 0.25;
            filter: grayscale(100%);
            box-sizing: border-box;
        }
        .ach-item-card.earned {
            opacity: 1;
            filter: grayscale(0%);
            border-color: #38bdf8;
            background: linear-gradient(145deg, var(--empty, rgba(255, 255, 255, 0.02)), rgba(56, 189, 248, 0.06));
        }
        .ach-card-icon { font-size: 20px; margin-bottom: 3px; }
        .ach-card-name { font-size: 11px; font-weight: 800; margin-bottom: 3px; color: var(--text, #fff); line-height: 1.2; }
        .ach-card-desc { font-size: 9px; opacity: 0.6; color: var(--text, #fff); line-height: 1.1; }

        .ach-progress-bar {
            background: var(--border, rgba(255, 255, 255, 0.1));
            border-radius: 10px;
            height: 5px;
            width: 100%;
            margin: 6px 0;
            overflow: hidden;
        }
        .ach-progress-fill {
            background: #38bdf8;
            height: 100%;
            width: 0%;
            transition: width 0.4s ease;
        }

        #tab-achievements { display: none; width: 100%; }
        #tab-achievements.active { display: block; }

        .game-meta-widgets {
            display: flex;
            justify-content: space-between;
            margin: 10px auto;
            max-width: 500px;
            gap: 10px;
        }
        .widget-box {
            background: var(--empty, rgba(255, 255, 255, 0.05));
            border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
            border-radius: 12px;
            padding: 6px 12px;
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            color: var(--text, #fff);
        }
        .widget-val { font-weight: 900; color: #38bdf8; }
        .widget-val.combo-active { color: #f59e0b; }
    `;
    document.head.appendChild(style);
})();

const LS = {
    get(key, def) {
        try {
            // Try Telegram WebApp storage first if available
            if (window.Telegram?.WebApp?.CloudStorage) {
                try {
                    // Use async API with Promise wrapper
                    return new Promise((resolve) => {
                        window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
                            if (error || !value) {
                                resolve(def);
                            } else {
                                try {
                                    resolve(JSON.parse(value));
                                } catch (e) {
                                    console.log('Telegram storage parse failed, falling back to localStorage');
                                    resolve(def);
                                }
                            }
                        });
                    });
                } catch (e) {
                    console.log('Telegram storage read failed, falling back to localStorage');
                    return Promise.resolve(JSON.parse(localStorage.getItem(key)) ?? def);
                }
            }
            // Fall back to localStorage
            return Promise.resolve(JSON.parse(localStorage.getItem(key)) ?? def);
        } catch(e) {
            console.error('Storage get error:', e);
            return Promise.resolve(def);
        }
    },
    set(key, val) {
        // Save to both Telegram and localStorage for synchronization
        try {
            // For best score, save to Telegram storage if available
            if (key === 'bestScore' && window.Telegram?.WebApp?.CloudStorage) {
                try {
                    window.Telegram.WebApp.CloudStorage.setItem(key, JSON.stringify(val), (error) => {
                        if (error) {
                            console.log('Telegram storage write failed, falling back to localStorage');
                            localStorage.setItem(key, JSON.stringify(val));
                        }
                    });
                } catch (e) {
                    console.log('Telegram storage write failed, falling back to localStorage');
                    localStorage.setItem(key, JSON.stringify(val));
                }
            }
            // For other data, use localStorage only
            localStorage.setItem(key, JSON.stringify(val));
        } catch(e) {
            console.error('Storage save failed:', e);
        }
    },
    saveProgressToCloud() {
        return new Promise((resolve) => {
            try {
                if (window.Telegram?.WebApp?.CloudStorage) {
                    const progressData = {
                        bestV: bestV,
                        stats: stats,
                        achievements: achievements
                    };
                    window.Telegram.WebApp.CloudStorage.setItem('user_progress', JSON.stringify(progressData), (error) => {
                        if (error) {
                            console.error('Failed to save progress to Telegram Cloud Storage:', error);
                            resolve(false);
                        } else {
                            console.log('Progress saved to Telegram Cloud Storage');
                            resolve(true);
                        }
                    });
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.error('Failed to save progress to Telegram Cloud Storage:', e);
                resolve(false);
            }
        });
    },
    loadProgressFromCloud() {
        return new Promise((resolve) => {
            try {
                if (window.Telegram?.WebApp?.CloudStorage) {
                    window.Telegram.WebApp.CloudStorage.getItem('user_progress', (error, savedData) => {
                        if (error || !savedData) {
                            console.log('No cloud data found, falling back to localStorage');
                            resolve(false);
                        } else {
                            try {
                                const progressData = JSON.parse(savedData);
                                bestV = progressData.bestV || bestV;
                                stats = progressData.stats || stats;
                                // Restore achievements
                                if (progressData.achievements) {
                                    for (const id in progressData.achievements) {
                                        if (achievements[id]) {
                                            achievements[id].earned = progressData.achievements[id].earned;
                                        }
                                    }
                                }
                                console.log('Progress loaded from Telegram Cloud Storage');
                                resolve(true);
                            } catch (e) {
                                console.error('Failed to parse cloud progress data:', e);
                                resolve(false);
                            }
                        }
                    });
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.error('Failed to load progress from Telegram Cloud Storage:', e);
                resolve(false);
            }
        });
    }
};

function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function getDailySeed() {
    const d = new Date();
    return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) * 77;
}

function getDailyModifierInfo() {
    const day = new Date().getDay();
    switch(day) {
        case 1: return { desc: "Чистая четверка (Все новые плитки появляются сразу равными 4!)", only4: true, badChance: false };
        case 3: return { desc: "Проклятие дебаффа (Плитки генерируются преимущественно в самых заполненных углах)", only4: false, badChance: true };
        case 5: return { desc: "Супер хардкор (Только плитки 4 и уменьшенное поле 4х4 без права на ошибку)", only4: true, badChance: true };
        default: return { desc: "Плотный спавн (Шанс появления плитки 4 увеличен до 40%)", only4: false, customChance: 0.4 };
    }
}

function predictNextTileValue() {
    // FIX: Ensure currentRng is always initialized
    if (!currentRng) {
        currentRng = mulberry32(currentSeed || Math.floor(Math.random() * 9999999));
    }

    const predictRng = mulberry32(currentSeed + scoreV + totalMovesCount + 999);
    const mod = getDailyModifierInfo();

    // FIX: Add null checks for Telegram WebView compatibility
    if (currentSeed === getDailySeed() && mod?.only4) return 4;
    if (currentSeed === getDailySeed() && mod?.customChance && predictRng() < mod.customChance) return 4;
    return predictRng() < 0.9 ? 2 : 4;
}

function generateGridFromSeed(sz) {
    const grid = Array(sz).fill().map(() => Array(sz).fill(0));
    let idCtr = 1;
    const mod = getDailyModifierInfo();
    const isDaily = (currentSeed === getDailySeed()); // FIX 1: Безопасный вызов флага daily

    for (let i = 0; i < 2; i++) {
        const empty = [];
        for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) if (!grid[y][x]) empty.push([y,x]);
        if (!empty.length) break;

        let idx = Math.floor(currentRng() * empty.length);
        if (isDaily && mod.badChance) { idx = empty.length - 1; }

        const [y,x] = empty[idx];
        let val = currentRng() < 0.9 ? 2 : 4;
        if (isDaily && mod.only4) val = 4;
        if (isDaily && mod.customChance && currentRng() < mod.customChance) val = 4;

        grid[y][x] = { id: idCtr++, value: val, merged: false, isNew: true };
    }
    idCounter = idCtr;
    return grid;
}

const boardEl = document.getElementById('board');
const gridBackgroundEl = document.getElementById('gridBackground');
const tileContainerEl = document.getElementById('tileContainer');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('gameOverOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const resultCardContainer = document.getElementById('resultCardContainer');
const toast = document.getElementById('toast');

function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function theme(t) { document.body.className = t; localStorage.theme = t; }
function toggleButtons(show) { document.getElementById('keyboardControls').style.display = show ? 'grid' : 'none'; localStorage.showButtons = show ? '1' : '0'; if(document.getElementById('btnToggle')) document.getElementById('btnToggle').checked = show; }

function changeSize(newSize) {
    if(newSize === size) return;
    size = newSize; localStorage.gridSize = size;
    start(); closeMenu(null,'mainMenu',true);
}

function startTimer() {
    // FIX: Enhanced timer race condition protection
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
    if (isTimerRunning) return; // Prevent duplicate timers

    isTimerRunning = true;
    timerIntervalId = setInterval(() => {
        try {
            if (!gameOver) {
                gameTime++;
                if (gameTime >= 300) earnAchievement('marathon');
                const statsTab = document.getElementById('tab-stats');
                if (statsTab?.classList.contains('active')) { renderStats(); }
            }
        } catch (e) {
            console.error('Timer error:', e);
            stopTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (timerIntervalId) { clearInterval(timerIntervalId); timerIntervalId = null; }
    isTimerRunning = false;
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function add() {
    const f = [];
    for(let y=0; y<size; y++) for(let x=0; x<size; x++) if(!g[y][x]) f.push([y,x]);
    if(!f.length) return;

    // FIX 8: closeCall теперь срабатывает только при реальной игре, а не на старте
    if (f.length <= 2 && scoreV > 500) earnAchievement('closeCall');

    const spawnRng = mulberry32(currentSeed + scoreV + totalMovesCount);
    let idx = Math.floor(spawnRng() * f.length);

    const mod = getDailyModifierInfo();
    if ((currentSeed === getDailySeed()) && mod.badChance) { idx = f.length - 1; }

    const [y,x] = f[idx];

    g[y][x] = { id: idCounter++, value: nextTileValue, merged: false, isNew: true };
    nextTileValue = predictNextTileValue();
    updateWidgetsUI();
}

function slideRow(row, tracker) {
    let items = row.filter(x => x !== 0);
    let result = [];
    for (let i = 0; i < items.length; i++) {
        if (i < items.length - 1 && items[i] && items[i+1] && items[i].value === items[i+1].value) {
            let mergedValue = items[i].value * 2;
            let finalAddedScore = mergedValue * comboMultiplier;
            scoreV += finalAddedScore;
            tracker.added += finalAddedScore;
            tracker.hasMerges = true;

            // FIX: Use a new ID for merged tiles to prevent conflicts
            result.push({ id: idCounter++, value: mergedValue, merged: true, isNew: false });
            i++;

            // Haptic feedback for tile merge
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }

            // Trigger animation for high-value tiles (1024+)
            if (mergedValue >= 1024) {
                const boardEl = document.getElementById('board');
                if (boardEl) {
                    boardEl.classList.add('shake-animation');
                    setTimeout(() => {
                        boardEl.classList.remove('shake-animation');
                    }, 300);
                }
            }
        } else if (items[i]) {
            result.push({ id: items[i].id, value: items[i].value, merged: false, isNew: false });
        }
    }
    while (result.length < size) result.push(0);
    return result;
}

function move(d) {
    if(gameOver) return;

    // FIX 1: Безопасный откат к JSON клонированию ради старых WebView в Telegram
    historyStack.push({
        grid: JSON.parse(JSON.stringify(g)),
        score: scoreV,
        idCounter: idCounter,
        gameTime: gameTime,
        comboMultiplier: comboMultiplier,
        nextTileValue: nextTileValue,
        movesLog: [...movesLog], // FIX 5: Полное копирование истории логов для Undo
        gameStarted: gameStarted
    });
    if(historyStack.length > 20) historyStack.shift();

    let tracker = { added: 0, hasMerges: false };

    // FIX 4: Генерация ультрабыстрого строкового хэша вместо JSON.stringify
    let oldStr = g.flat().map(c => c ? c.value : 0).join(',');

    for(let y=0; y<size; y++) for(let x=0; x<size; x++) if(g[y][x]) { g[y][x].isNew = false; g[y][x].merged = false; }

    if (d === 'l') g = g.map(r => slideRow(r, tracker));
    if (d === 'r') g = g.map(r => slideRow([...r].reverse(), tracker).reverse());
    if (d === 'u' || d === 'd') {
        for (let x = 0; x < size; x++) {
            let col = g.map(r => r[x]);
            if (d === 'd') col.reverse(); col = slideRow(col, tracker); if (d === 'd') col.reverse();
            for (let y = 0; y < size; y++) g[y][x] = col[y];
        }
    }

    let newStr = g.flat().map(c => c ? c.value : 0).join(',');

    if (oldStr !== newStr) {
        movesLog.push(d);
        totalMovesCount++;

        // FIX 2: Учет статистики партий защищен флагом gameStarted
        if (!gameStarted) {
            gameStarted = true;
            stats.gamesPlayed++;
            saveStats();
            earnAchievement('firstMove');
        }

        if (tracker.hasMerges) {
            comboMultiplier++;
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }

            // Trigger combo animation
            const widgetsContainer = document.getElementById('gameWidgetsContainer');
            if (widgetsContainer) {
                widgetsContainer.classList.add('shake-animation');
                setTimeout(() => {
                    widgetsContainer.classList.remove('shake-animation');
                }, 300);
            }

            // Trigger score box animation
            const scoreBox = document.querySelector('.score-box');
            if (scoreBox) {
                scoreBox.classList.add('shake-animation');
                setTimeout(() => {
                    scoreBox.classList.remove('shake-animation');
                }, 300);
            }
        } else {
            comboMultiplier = 1;
        }

        if (totalMovesCount === 77) earnAchievement('lucky77');
        if (tracker.added > 0) showScoreAddition(tracker.added);

        add(); updateScore(); render(); checkGameState(); checkAchievements(); saveGame();
    } else {
        historyStack.pop();
        if (boardEl) {
            boardEl.classList.remove('shake-board');
            void boardEl.offsetWidth;
            boardEl.classList.add('shake-board');
        }
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
    }
}

function showScoreAddition(amount) {
    const cont = document.getElementById('scoreAdditionContainer');
    if(!cont) return; cont.innerHTML = '';
    const el = document.createElement('div'); el.className = 'score-addition'; el.textContent = `+${amount}`; cont.appendChild(el);
}

function undo() {
    if(gameOver || !historyStack.length) return;
    const prev = historyStack.pop();
    g = prev.grid; scoreV = prev.score; idCounter = prev.idCounter; gameTime = prev.gameTime || gameTime;
    comboMultiplier = prev.comboMultiplier || 1;
    nextTileValue = prev.nextTileValue || 2;
    movesLog = prev.movesLog || []; // FIX 5: Полное восстановление лога ходов
    gameStarted = prev.gameStarted ?? true;

    if(totalMovesCount > 0) totalMovesCount--;

    earnAchievement('timeTraveler');

    updateScore(); render(); checkGameState(); saveGame(); updateWidgetsUI();
    showToast('Ход отменен! ↩️');
}

function triggerGameOverVisuals() {
    if (!boardEl) return;
    boardEl.classList.add('shake-board');
    setTimeout(() => boardEl.classList.remove('shake-board'), 500);

    const tiles = tileContainerEl.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.add('tile-shatter-fx');
        const randomX = (Math.random() - 0.5) * 160;
        const randomY = 350 + Math.random() * 200;
        const randomAngle = (Math.random() - 0.5) * 360;

        setTimeout(() => {
            tile.style.transform = `translate(calc(${tile.style.getPropertyValue('--x')} + ${randomX}px), calc(${tile.style.getPropertyValue('--y')} + ${randomY}px)) rotate(${randomAngle}deg)`;
            tile.style.opacity = '0';
        }, 50);
    });

    setTimeout(() => {
        overlay.style.display = 'flex';
        overlay.classList.add('open');
    }, 450);
}

function checkGameState() {
    let hasTarget = false;
    for(let y=0; y<size; y++) for(let x=0; x<size; x++) {
        if(g[y][x] && g[y][x].value >= 2048) hasTarget = true;
        if(g[y][x] && g[y][x].value > stats.bestTile) stats.bestTile = g[y][x].value;
    }
    if(hasTarget && !winShown) {
        winShown = true; overlayTitle.textContent = 'Вы победили! 🎉';
        overlay.style.display = 'flex';
        overlay.classList.add('open');
        gameOver = true;
        stats.wins++; endGame(); return;
    }

    let movesPossible = false;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!g[y][x]) { movesPossible = true; break; }
            if (x < size - 1 && g[y][x + 1] && g[y][x].value === g[y][x + 1].value) { movesPossible = true; break; }
            if (y < size - 1 && g[y + 1][x] && g[y][x].value === g[y + 1][x].value) { movesPossible = true; break; }
        }
        if (movesPossible) break;
    }

    if (!movesPossible) {
        overlayTitle.textContent = 'Игра окончена! 💀';
        gameOver = true;
        triggerGameOverVisuals();
        endGame();

        // Haptic feedback for game over
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
    }
}

function endGame() {
    stopTimer();
    stats.totalScore += scoreV;
    saveStats();

    let cardHtml = `<div style="background:var(--empty); padding:14px; border-radius:16px; border:1px solid var(--border); width:100%; text-align:center; box-sizing:border-box;">
        <div style="font-size:13px; opacity:0.6; text-transform:uppercase;">Финальный счет</div>
        <div style="font-size:32px; font-weight:900; color:#38bdf8; margin:4px 0;">${scoreV}</div>
        <div style="font-size:12px; opacity:0.5; margin-bottom:10px;">Время партии: ${formatTime(gameTime)}</div>`;

    if (rivalScore !== null) {
        const winDuel = scoreV > rivalScore;
        cardHtml += `<div style="border-top:1px solid var(--border); margin-top:10px; padding-top:10px;">
            <div style="font-size:13px; opacity:0.6;">Результат дуэли против соперника:</div>
            <div style="font-size:16px; font-weight:800; color:${winDuel ? '#22c55e' : '#ef4444'}; margin-top:4px;">
                ${winDuel ? '🏆 ВЫ ВЫИГРАЛИ ДУЭЛЬ!' : '❌ СОПЕРНИК ОКАЗАЛСЯ СИЛЬНЕЕ'}
            </div>
            <div style="font-size:12px; opacity:0.5; margin-top:2px;">Счет соперника: ${rivalScore}</div>
        </div>`;
    }
    cardHtml += `</div>`;
    resultCardContainer.innerHTML = cardHtml;

    // Add share button to the game over overlay
    setTimeout(() => {
        const shareButton = document.createElement('button');
        shareButton.className = 'btn opt-share';
        shareButton.style.marginTop = '12px';
        shareButton.style.padding = '12px 24px';
        shareButton.innerHTML = '🚀 Поделиться рекордом';
        shareButton.onclick = shareToStory;
        resultCardContainer.appendChild(shareButton);
    }, 100);
}

function checkAchievements() {
    let maxTile = 0;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (g[y][x]) maxTile = Math.max(maxTile, g[y][x].value);

    if (scoreV >= 1000 && !achievements.score1000.earned) earnAchievement('score1000');
    if (scoreV >= 5000 && !achievements.score5000.earned) earnAchievement('score5000');
    if (scoreV >= 10000 && !achievements.score10000.earned) earnAchievement('score10000');
    if (scoreV >= 50000 && !achievements.score50000.earned) earnAchievement('score50000');

    if (maxTile >= 64 && !achievements.tile64.earned) earnAchievement('tile64');
    if (maxTile >= 256 && !achievements.tile256.earned) earnAchievement('tile256');
    if (maxTile >= 512 && !achievements.tile512.earned) earnAchievement('tile512');
    if (maxTile >= 1024 && !achievements.tile1024.earned) earnAchievement('tile1024');
    if (maxTile >= 2048 && !achievements.tile2048.earned) earnAchievement('tile2048');

    if (maxTile >= 2048 && gameTime < 300 && !achievements.speedrun.earned) earnAchievement('speedrun');
    if (totalMovesCount >= 500 && !achievements.tactician.earned) earnAchievement('tactician');
    if (size === 6 && !achievements.giantBoard.earned) earnAchievement('giantBoard');
    if (size === 4 && !achievements.smallBoard.earned) earnAchievement('smallBoard');
}

function earnAchievement(id) {
    if (!achievements[id] || achievements[id].earned) return;
    achievements[id].earned = true;
    LS.set('achievements2048', achievements);
    showToast(`🏅 Достижение: ${achievements[id].name}`);

    // Haptic feedback for achievement
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }

    // Save progress to cloud storage
    LS.saveProgressToCloud();
}

function loadStats() {
    stats = LS.get('stats2048', stats);
    const savedAch = LS.get('achievements2048', null);
    if (savedAch) {
        for (const id in savedAch) if (achievements[id]) achievements[id].earned = savedAch[id].earned;
    }
}

function saveStats() { LS.set('stats2048', stats); }

function renderStats() {
    const c = document.getElementById('statsContainer');
    if (!c) return;
    c.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; gap:4px; padding:10px; box-sizing:border-box; color:var(--text);">
            <div>🎮 Сыграно игр: <b>${stats.gamesPlayed}</b></div>
            <div>🏆 Всего побед: <b>${stats.wins}</b></div>
            <div>⭐ Лучшая плитка: <b>${stats.bestTile}</b></div>
            <div>🕒 Время текущей игры: <b>${formatTime(gameTime)}</b></div>
        </div>`;
}

function updateWidgetsUI() {
    let widgetsContainer = document.getElementById('gameWidgetsContainer');
    if (!widgetsContainer) {
        widgetsContainer = document.createElement('div');
        widgetsContainer.id = 'gameWidgetsContainer';
        widgetsContainer.className = 'game-meta-widgets';
        if (boardEl && boardEl.parentNode) {
            boardEl.parentNode.insertBefore(widgetsContainer, boardEl);
        }
    }
    if (widgetsContainer) {
        widgetsContainer.innerHTML = `
            <div class="widget-box"><span>Плитка:</span><span class="widget-val">${nextTileValue}</span></div>
            <div class="widget-box"><span>Комбо:</span><span class="widget-val ${comboMultiplier > 1 ? 'combo-active' : ''}">x${comboMultiplier}</span></div>
        `;
    }
}

function updateScore() {
    const prevBest = bestV;
    scoreEl.textContent = scoreV;
    if (scoreV > bestV) { bestV = scoreV; localStorage.bestScore = bestV; }
    bestEl.textContent = bestV;
    // Анимация нового рекорда
    if (scoreV > prevBest && prevBest > 0) {
        bestEl.classList.remove('record-bump');
        void bestEl.offsetWidth;
        bestEl.classList.add('record-bump');
        bestEl.classList.add('new-record-animation');
        setTimeout(() => {
            bestEl.classList.remove('record-bump');
            bestEl.classList.remove('new-record-animation');
        }, 900);
        showNewRecordPopup();

        // Haptic feedback for new record
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    }
    updateTargetDisplay();
}

function updateTargetDisplay() {
    const card = document.getElementById('targetCard');
    if (!card) return;
    const target = rivalScore ?? null;
    if (target !== null && target > 0) {
        card.classList.remove('target-hidden');
        card.innerHTML = `<span class="target-dot"></span><span class="target-text">Цель: <span class="target-score">${target}</span></span>`;
    } else {
        card.classList.add('target-hidden');
        card.innerHTML = '';
    }
}

function buildGridBackground() {
    gridBackgroundEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridBackgroundEl.innerHTML = '';
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        gridBackgroundEl.appendChild(cell);
    }
}

function render() {
    tileContainerEl.innerHTML = '';
    const boardW = boardEl.clientWidth - 24;
    const gap = 10;
    const cellSize = (boardW - (size - 1) * gap) / size;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = g[y][x];
            if (!cell) continue;

            const el = document.createElement('div');
            const xPos = x * (cellSize + gap);
            const yPos = y * (cellSize + gap);

            el.className = `cell tile v${cell.value}`;
            if (cell.isNew) el.classList.add('new-tile');
            if (cell.merged) el.classList.add('merged-tile');

            el.textContent = cell.value;
            el.style.width = `${cellSize}px`;
            el.style.height = `${cellSize}px`;
            el.style.setProperty('--x', `${xPos}px`);
            el.style.setProperty('--y', `${yPos}px`);
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;

            tileContainerEl.appendChild(el);
        }
    }
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(render, 100);
});

function start() {
    if (totalMovesCount > 0 && !gameOver) earnAchievement('cleanSlate');

    gameOver = false; winShown = false; scoreV = 0; totalMovesCount = 0; movesLog = [];
    gameTime = 0; comboMultiplier = 1; gameStarted = false; // Сброс состояния новой сессии
    recordBrokenThisRun = false; // FIX: Сброс флага нового рекорда при старте новой игры
    overlay.style.display = 'none';
    overlay.classList.remove('open');
    historyStack = [];

    // FIX 3: Сид теперь ВСЕГДА обновляется заново, исключая бесконечную повторяемость
    currentSeed = Math.floor(Math.random() * 9999999);
    currentRng = mulberry32(currentSeed);

    nextTileValue = predictNextTileValue();

    buildGridBackground();
    g = generateGridFromSeed(size);
    updateScore();
    render();
    startTimer();
    updateWidgetsUI();

    // Гарантируем, что вкладка ачивок не пропадет из DOM при жесткой перезагрузке сессии
    initAchievementsUI();
    renderAchievementsTab(); // FIX: Обновляем отображение ачивок при старте новой игры
}

function saveGame() {
    localStorage.savedGame = JSON.stringify({ g, size, scoreV, idCounter, gameOver, winShown, currentSeed, movesLog, rivalScore, gameTime, comboMultiplier, gameStarted, currentBattleId });
}

function initAchievementsUI() {
    const mainMenu = document.getElementById('mainMenu');
    if (!mainMenu) return;

    if (!document.querySelector('.tab-btn[data-tab="achievements"]')) {
        const firstTabBtn = mainMenu.querySelector('.tab-btn');
        if (firstTabBtn && firstTabBtn.parentElement) {
            const achBtn = document.createElement('button');
            achBtn.className = 'tab-btn';
            achBtn.setAttribute('data-tab', 'achievements');
            achBtn.innerHTML = '🏆 Ачивки';
            achBtn.addEventListener('click', () => switchTab('achievements'));
            firstTabBtn.parentElement.appendChild(achBtn);
        }
    }

    if (!document.getElementById('tab-achievements')) {
        const firstTabContent = mainMenu.querySelector('.tab-content');
        if (firstTabContent && firstTabContent.parentElement) {
            const achContent = document.createElement('div');
            achContent.id = 'tab-achievements';
            achContent.className = 'tab-content';
            achContent.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin: 4px 0; font-size:12px; color:var(--text); font-weight:bold;">
                    <span>Прогресс:</span>
                    <span><b id="achUnlockedCount">0</b>/50</span>
                </div>
                <div class="ach-progress-bar"><div id="achProgressFill" class="ach-progress-fill"></div></div>
                <div id="achievementsGridContainer" class="ach-menu-grid"></div>
            `;
            firstTabContent.parentElement.appendChild(achContent);
        }
    }
}

function renderAchievementsTab() {
    const grid = document.getElementById('achievementsGridContainer');
    if (!grid) return;

    grid.innerHTML = '';
    let unlocked = 0;
    let total = 0;

    // Count total and earned achievements
    for (const id in achievements) {
        total++;
        if (achievements[id].earned) unlocked++;
    }

    // Update progress display
    const countEl = document.getElementById('achUnlockedCount');
    const fillEl = document.getElementById('achProgressFill');
    if (countEl) countEl.textContent = unlocked;
    if (fillEl) {
        const percent = (unlocked / total) * 100;
        fillEl.style.width = `${percent}%`;
    }

    // If no achievements earned, show empty state
    if (unlocked === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'no-achievements';
        emptyState.innerHTML = `
            <div class="icon">🏆</div>
            <div class="text">Список пока пуст! Вы еще не разблокировали ни одного достижения. Время объединить пару плиток!</div>
        `;
        grid.appendChild(emptyState);
        return;
    }

    // Only render earned achievements
    for (const id in achievements) {
        const a = achievements[id];
        if (!a.earned) continue; // Skip unearned achievements

        const card = document.createElement('div');
        card.className = `ach-item-card earned`;
        card.innerHTML = `
            <div class="ach-card-icon">${a.icon}</div>
            <div class="ach-card-name">${a.name}</div>
            <div class="ach-card-desc">${a.desc}</div>
        `;
        grid.appendChild(card);
    }
}

function loadGame() {
    let saved = null;
    try {
        saved = localStorage.savedGame ? JSON.parse(localStorage.savedGame) : null;
    } catch (e) {
        console.error('Failed to parse saved game data:', e);
        localStorage.removeItem('savedGame');
    }

    size = parseInt(localStorage.gridSize) || 4;
    bestV = parseInt(localStorage.bestScore) || 0;
    theme(localStorage.theme || 'dark');
    toggleButtons(localStorage.showButtons === '1');

    loadStats();
    initAchievementsUI();
    renderStats();

    const urlParams = new URLSearchParams(window.location.search);
    const shareSeed = urlParams.get('seed');
    const shareScore = urlParams.get('score');
    const shareSize = urlParams.get('size');
    const battleId = urlParams.get('battle');

    if (battleId) {
        // Handle battle invite link
        currentBattleId = battleId;
        showToast(`⚔️ Вы присоединились к битве ${battleId}!`);
        start();
        return;
    }

    if (shareSeed && shareScore) {
        currentSeed = parseInt(shareSeed);
        const challengeScore = parseInt(shareScore);
        size = parseInt(shareSize) || 4;
        localStorage.gridSize = size;

        // If the challenge score is higher than current best, update best score
        if (challengeScore > bestV) {
            bestV = challengeScore;
            localStorage.bestScore = bestV;
            LS.set('bestScore', bestV);
            LS.saveProgressToCloud();
            showToast('🏆 Новый рекорд из вызова! Ваш лучший счет обновлен.');
        } else {
            showToast('⚔️ Вызов принят! Побейте счет друга.');
        }

        rivalScore = challengeScore;
        start();
        // FIX: Ensure target display is updated immediately after rivalScore is set
        setTimeout(() => updateTargetDisplay(), 100);
        return;
    }

    if (saved && saved.size === size && !saved.gameOver) {
        g = saved.g; scoreV = saved.scoreV; idCounter = saved.idCounter;
        gameOver = saved.gameOver; winShown = saved.winShown;
        currentSeed = saved.currentSeed; movesLog = saved.movesLog || [];
        rivalScore = saved.rivalScore ?? null;
        gameTime = saved.gameTime || 0;
        comboMultiplier = saved.comboMultiplier || 1;
        gameStarted = saved.gameStarted ?? true;
        currentBattleId = saved.currentBattleId ?? null;
        currentRng = mulberry32(currentSeed);
        nextTileValue = predictNextTileValue();
        buildGridBackground(); updateScore(); render(); startTimer(); updateWidgetsUI();
    } else {
        currentSeed = null; rivalScore = null;
        start();
    }
}

function showDailyChallenge() {
    closeMenu(null, 'mainMenu', true);
    const menuEl = document.getElementById('dailyChallengeMenu');
    const info = getDailyModifierInfo();
    document.getElementById('dailyModifierDesc').textContent = info.desc;
    document.getElementById('dailySeedDisplay').textContent = getDailySeed();

    menuEl.style.display = 'flex';
    setTimeout(() => menuEl.classList.add('open'), 10);
}

function startDailyChallenge() {
    closeMenu(null, 'dailyChallengeMenu', true);
    currentSeed = getDailySeed();
    rivalScore = null;

    earnAchievement('dailyDone');

    if (new Date().getDay() === 5) { size = 4; }
    localStorage.gridSize = size;

    showToast('🎯 Хардкор-испытание началось!');
    start();
}

function generateBattleId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getBattleInviteLink() {
    // Generate battle ID only if none exists
    if (!currentBattleId) {
        currentBattleId = generateBattleId();
    }
    const base = window.location.origin + window.location.pathname;
    return `${base}?battle=${encodeURIComponent(currentBattleId)}`;
}

function getChallengeLink() {
    const base = window.location.origin + window.location.pathname;
    return `${base}?seed=${currentSeed}&score=${scoreV}&size=${size}`;
}

function copyChallengeLink() {
    navigator.clipboard.writeText(getChallengeLink()).then(() => showToast('📋 Ссылка скопирована!'));
}

function copyBattleInviteLink() {
    const link = getBattleInviteLink();
    navigator.clipboard.writeText(link).then(() => {
        showToast('🔗 Приглашение скопировано!');
        // Save game state to persist the battle ID
        saveGame();
        // Display the link to the user
        setTimeout(() => {
            const linkDisplay = document.createElement('div');
            linkDisplay.style.position = 'fixed';
            linkDisplay.style.bottom = '40px';
            linkDisplay.style.left = '50%';
            linkDisplay.style.transform = 'translateX(-50%)';
            linkDisplay.style.background = 'rgba(15, 23, 42, 0.95)';
            linkDisplay.style.color = 'white';
            linkDisplay.style.padding = '12px 20px';
            linkDisplay.style.borderRadius = '16px';
            linkDisplay.style.fontSize = '14px';
            linkDisplay.style.zIndex = '100';
            linkDisplay.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            linkDisplay.textContent = `🔗 Ваша ссылка: ${link}`;
            linkDisplay.id = 'battleLinkDisplay';
            document.body.appendChild(linkDisplay);

            setTimeout(() => {
                const display = document.getElementById('battleLinkDisplay');
                if (display) display.remove();
            }, 5000);
        }, 500);
    });
}

function challengeFriend() {
    const link = getBattleInviteLink();
    currentBattleId = currentBattleId || generateBattleId();

    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Присоединяйся к битве в 2048 Duel! ⚔️')}`);
    } else {
        copyBattleInviteLink();
    }
}

function shareResult() {
    const text = `Я набрал ${scoreV} очков на поле ${size}×${size} в 2048 Duel! Сможешь лучше? 🚀`;
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`);
    } else {
        showToast('🚀 Результат готов к отправке!');
    }
}

function openLeaderboard() {
    closeMenu(null, 'mainMenu', true);
    const menuEl = document.getElementById('leaderMenu');
    const listEl = document.getElementById('leaderboardContent');
    listEl.innerHTML = '';

    // Start with fixed leaders
    let leaders = [...fixedLeaders];

    // Add bot names with generated scores
    botNames.forEach(bot => {
        leaders.push({
            name: bot.name,
            score: bot.score !== null ? bot.score : Math.floor(mulberry32(105 + leaders.length)() * 35000) + 2048,
            rank: 0
        });
    });

    // Add current player
    leaders.push({ name: "Вы (Вызов)", score: scoreV, isPlayer: true });

    // Sort by score (descending)
    leaders.sort((a, b) => b.score - a.score);

    leaders.forEach((l, idx) => {
        const el = document.createElement('div');
        el.className = 'leader-item';
        if (l.isPlayer) {
            el.style.borderColor = '#38bdf8';
        }
        el.innerHTML = `
            <div class="leader-name"><span class="leader-rank">#${idx+1}</span>${l.name}</div>
            <div class="leader-score">${l.score}</div>`;
        listEl.appendChild(el);
    });

    menuEl.style.display = 'flex';
    setTimeout(() => menuEl.classList.add('open'), 10);
}

function openMenu(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.style.display = 'flex';
    setTimeout(() => m.classList.add('open'), 10);
    if (id === 'mainMenu') switchTab('game');
    isMenuOpen = true;
}

function closeMenu(e, id, force = false) {
    const m = document.getElementById(id);
    if (m && (force || e.target === m)) {
        m.classList.remove('open');
        setTimeout(() => m.style.display = 'none', 250);
        isMenuOpen = false;
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.toggle('active', c.id === `tab-${tabId}`);
    });
    if (tabId === 'stats') renderStats();
    if (tabId === 'achievements') renderAchievementsTab();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
});

window.addEventListener('keydown', e => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) { move('u'); e.preventDefault(); }
    if (['ArrowDown', 'KeyS'].includes(e.code)) { move('d'); e.preventDefault(); }
    if (['ArrowLeft', 'KeyA'].includes(e.code)) { move('l'); e.preventDefault(); }
    if (['ArrowRight', 'KeyD'].includes(e.code)) { move('r'); e.preventDefault(); }
}, { passive: false });

let tsX = null, tsY = null;
let isMenuOpen = false;

window.addEventListener('touchstart', e => {
    tsX = e.touches[0].clientX; tsY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', e => {
    if (!tsX || !tsY || isMenuOpen) return;
    let tdX = e.touches[0].clientX - tsX, tdY = e.touches[0].clientY - tsY;
    let swipeThreshold = Math.min(window.innerWidth * 0.1, 60);

    if (Math.max(Math.abs(tdX), Math.abs(tdY)) > swipeThreshold) {
        if (Math.abs(tdX) > Math.abs(tdY)) {
            move(tdX > 0 ? 'r' : 'l');
        } else {
            move(tdY > 0 ? 'd' : 'u');
        }
        tsX = null; tsY = null;
    }
}, { passive: true });

// Функция для показа всплывающего окна нового рекорда
function showNewRecordPopup() {
    // FIX: Проверяем, что попап еще не существует и рекорд не был показан в этой сессии
    if (recordBrokenThisRun || document.querySelector('.new-record-popup')) {
        return;
    }

    recordBrokenThisRun = true;

    const popup = document.createElement('div');
    popup.className = 'new-record-popup';
    popup.textContent = 'НОВЫЙ РЕКОРД! 🏆';
    document.body.appendChild(popup);

    // Удаляем попап после завершения анимации
    setTimeout(() => {
        if (popup && popup.parentNode) {
            popup.remove();
        }
    }, 1500);
}

// Share to Story function
function shareToStory() {
    const text = `🔥 Мой рекорд в 2048 Duel — ${bestV} очков! Сможешь побить? 🏆`;

    if (window.Telegram?.WebApp?.shareToStory) {
        try {
            window.Telegram.WebApp.shareToStory({
                type: 'text',
                text: text,
                widget_link: {
                    url: 'https://t.me/your_2048_bot/app', // Direct link to Telegram bot
                    text: 'Играй в 2048 Duel!'
                }
            });
        } catch (e) {
            console.error('Failed to share to story:', e);
            // Fallback to regular sharing
            shareResult();
        }
    } else {
        // Fallback to regular sharing if shareToStory is not available
        shareResult();
    }
}

// Добавленные функции
async function initGame() {
    // Загружаем настройки из localStorage
    size = parseInt(localStorage.gridSize) || 4;
    theme(localStorage.theme || 'dark');
    toggleButtons(localStorage.showButtons === '1');
    bestV = parseInt(localStorage.bestScore) || 0;

    // Try to load progress from Telegram Cloud Storage first
    try {
        const cloudLoaded = await LS.loadProgressFromCloud();
        if (!cloudLoaded) {
            // If cloud storage fails or is not available, load from localStorage
            bestV = parseInt(localStorage.bestScore) || bestV;
            loadStats();
        }
    } catch (e) {
        console.error('Failed to load cloud progress:', e);
        // Fallback to localStorage
        bestV = parseInt(localStorage.bestScore) || bestV;
        loadStats();
    }

    // Инициализируем игру
    buildGridBackground();
    start();
}

// Запуск игры при загрузке DOM
window.addEventListener('DOMContentLoaded', initGame);
