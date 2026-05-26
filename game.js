class Game2048 {
    constructor() {
        // DOM Elements
        this.tilesContainer = document.getElementById('tilesContainer');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.bestDisplay = document.getElementById('bestDisplay');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlaySub = document.getElementById('overlaySub');
        this.overlayContinue = document.getElementById('overlayContinue');
        this.overlayClose = document.getElementById('overlayClose');
        this.overlayRestart = document.getElementById('overlayRestart');
        this.board = document.getElementById('board');
        this.undoBtn = document.getElementById('undoBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.achievementsOverlay = document.getElementById('achievementsOverlay');
        this.achievementsContainer = document.getElementById('achievementsContainer');

        // Game State
        this.grid = Array.from({ length: 4 }, () => Array(4).fill(null));
        this.score = 0;
        this.bestScore = 0;
        this.moves = 0;
        this.tileIdCounter = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.winOverlayShown = false;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.history = [];
        this.gameFinished = false;
        this.cellSize = 0;
        this.saveTimeout = null;
        this.tileElements = new Map();

        // Stats and Achievements
        this.stats = {
            games: 0,
            wins: 0,
            maxTile: 0,
            totalScore: 0,
            bestTime: null,
            totalMoves: 0,
            totalTime: 0
        };

        this.achievements = [
            { id: 'score100', name: '100 очков', desc: 'Набрать 100 очков', icon: '🎯', target: 100,
                progress: () => this.stats.totalScore },
            { id: 'score500', name: '500 очков', desc: 'Набрать 500 очков', icon: '⭐', target: 500,
            progress: () => this.stats.totalScore },
            { id: 'score2000', name: '2000 очков', desc: 'Набрать 2000 очков', icon: '🌟', target: 2000,
                progress: () => this.stats.totalScore },
            { id: 'tile512', name: 'Плитка 512', desc: 'Создать плитку 512', icon: '🟧', target: 1, progress: () =>
                    this.stats.maxTile >= 512 ? 1 : 0 },
            { id: 'tile1024', name: 'Плитка 1024', desc: 'Создать плитку 1024', icon: '🟪', target: 1,
                progress: () => this.stats.maxTile >= 1024 ? 1 : 0 },
            { id: 'tile2048', name: 'Плитка 2048', desc: 'Достигнуть 2048', icon: '👑', target: 1, progress: () =>
                    this.stats.wins > 0 ? 1 : 0 },
            { id: 'tile4096', name: 'Плитка 4096', desc: 'Создать плитку 4096', icon: '💎', target: 1,
                progress: () => this.stats.maxTile >= 4096 ? 1 : 0 },
            { id: 'tile8192', name: 'Плитка 8192', desc: 'Создать плитку 8192', icon: '🔮', target: 1,
                progress: () => this.stats.maxTile >= 8192 ? 1 : 0 },
            { id: 'games5', name: '5 игр', desc: 'Сыграть 5 игр', icon: '🎮', target: 5, progress: () => this.stats
                    .games },
            { id: 'games20', name: '20 игр', desc: 'Сыграть 20 игр', icon: '🕹️', target: 20, progress: () => this
                    .stats.games },
            { id: 'moves50', name: '50 ходов', desc: 'Сделать 50 ходов', icon: '♟️', target: 50, progress: () => this
                    .stats.totalMoves },
            { id: 'moves200', name: '200 ходов', desc: 'Сделать 200 ходов', icon: '♞', target: 200,
            progress: () => this.stats.totalMoves },
            { id: 'time10min', name: '10 минут', desc: 'Провести в игре 10 минут', icon: '⏳', target: 600,
                progress: () => this.stats.totalTime }
        ];

        this.unlockedAchievements = [];
        this.leaderboard = [];

        // Managers
        this.storage = new StorageManager(this);
        this.ui = new UIManager(this);
    }

    formatTime(s) {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }

    getVector(dir) {
        const vecs = { up: { dr: -1, dc: 0 }, down: { dr: 1, dc: 0 }, left: { dr: 0, dc: -1 }, right: { dr: 0,
                dc: 1 } };
        return vecs[dir];
    }

    addRandomTile() {
        const empty = [];
        for (let r = 0; r < 4; r++)
            for (let c = 0; c < 4; c++)
                if (!this.grid[r][c]) empty.push({ r, c });
        if (!empty.length) return;
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[r][c] = { id: ++this.tileIdCounter, value, isNew: true, merged: false };
    }

    isGameOver() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (!this.grid[r][c]) return false;
                const v = this.grid[r][c].value;
                if (r < 3 && this.grid[r + 1][c] && this.grid[r + 1][c].value === v) return false;
                if (c < 3 && this.grid[r][c + 1] && this.grid[r][c + 1].value === v) return false;
            }
        }
        return true;
    }

    hasWinningTile() {
        for (let r = 0; r < 4; r++)
            for (let c = 0; c < 4; c++)
                if (this.grid[r][c] && this.grid[r][c].value >= 2048) return true;
        return false;
    }

    pushState() {
        this.history.push({
            grid: this.grid.map(row => row.map(tile => tile ? { ...tile } : null)),
            score: this.score,
            moves: this.moves,
            timerSeconds: this.timerSeconds,
            gameOver: this.gameOver,
            gameWon: this.gameWon,
            winOverlayShown: this.winOverlayShown
        });
        if (this.history.length > 30) this.history.shift();
    }

    popState() {
        if (!this.history.length) return false;
        const prev = this.history.pop();
        this.grid = prev.grid.map(row => row.map(tile => tile ? { ...tile, isNew: false,
            merged: false } : null));
        this.score = prev.score;
        this.moves = prev.moves;
        this.timerSeconds = prev.timerSeconds;
        this.gameOver = prev.gameOver;
        this.gameWon = prev.gameWon;
        this.winOverlayShown = prev.winOverlayShown;
        this.timerDisplay.textContent = this.formatTime(this.timerSeconds);
        this.scoreDisplay.textContent = this.score;
        this.bestDisplay.textContent = this.bestScore;
        if (this.gameOver && !this.isGameOver()) {
            this.gameOver = false;
            this.startTimer();
        }
        return true;
    }

    move(direction) {
        if (this.gameOver || this.winOverlayShown) return;
        if (isAnyOverlayOpen()) return;

        this.pushState();
        const vec = this.getVector(direction);
        let moved = false;
        let gained = 0;
        const mergedPositions = [];

        const traverse = (callback) => {
            const range = [0, 1, 2, 3];
            if (vec.dr === 1) range.reverse();
            if (vec.dc === 1) range.reverse();
            for (const r of range)
                for (const c of range)
                    callback(r, c);
        };

        const compress = () => {
            let changed = false;
            traverse((r, c) => {
                const tile = this.grid[r][c];
                if (!tile) return;
                let nr = r,
                    nc = c;
                while (true) {
                    const tr = nr + vec.dr,
                        tc = nc + vec.dc;
                    if (tr < 0 || tr > 3 || tc < 0 || tc > 3) break;
                    if (this.grid[tr][tc]) break;
                    nr = tr;
                    nc = tc;
                }
                if (nr !== r || nc !== c) {
                    this.grid[nr][nc] = tile;
                    this.grid[r][c] = null;
                    changed = true;
                }
            });
            return changed;
        };

        const merge = () => {
            let changed = false;
            traverse((r, c) => {
                const tile = this.grid[r][c];
                if (!tile || tile.merged) return;
                const nr = r + vec.dr,
                    nc = c + vec.dc;
                if (nr < 0 || nr > 3 || nc < 0 || nc > 3) return;
                const next = this.grid[nr][nc];
                if (next && next.value === tile.value && !next.merged) {
                    next.value *= 2;
                    next.merged = true;
                    this.grid[r][c] = null;
                    gained += next.value;
                    this.stats.maxTile = Math.max(this.stats.maxTile, next.value);
                    mergedPositions.push({ r: nr, c: nc });
                    changed = true;
                }
            });
            return changed;
        };

        const moved1 = compress();
        const moved2 = merge();
        const moved3 = compress();
        moved = moved1 || moved2 || moved3;

        if (!moved) {
            this.history.pop();
            return;
        }

        this.score += gained;
        this.moves++;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('best2048', this.bestScore);
        }
        this.addRandomTile();

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            this.ui.renderTiles(mergedPositions, gained);
            if (mergedPositions.length) this.ui.spawnMergeParticles(mergedPositions);
        });

        // Сбрасываем merged флаги после рендера
        for (let r = 0; r < 4; r++)
            for (let c = 0; c < 4; c++)
                if (this.grid[r][c]) this.grid[r][c].merged = false;


        if (!this.gameWon && this.hasWinningTile()) {
            this.gameWon = true;
            this.winOverlayShown = true;
            this.stopTimer();
            this.ui.spawnConfetti();
            setTimeout(() => this.ui.showOverlay('win'), 400);
        } else if (!this.gameOver && this.isGameOver()) {
            this.gameOver = true;
            this.stopTimer();
            this.ui.showOverlay('lose');
        }
        this.undoBtn.disabled = this.history.length === 0;
        this.scheduleSave();
        this.checkNewAchievements();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.gameOver && !this.winOverlayShown) {
                this.timerSeconds++;
                this.timerDisplay.textContent = this.formatTime(this.timerSeconds);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) { clearInterval(this.timerInterval);
            this.timerInterval = null; }
    }

    updateCellSize() {
        const wrapperWidth = this.board.clientWidth;
        const padding = 20; // 10px * 2
        const totalGaps = 3 * 10;
        this.cellSize = (wrapperWidth - padding - totalGaps) / 4;
    }

    scheduleSave() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => { this.storage.saveGameState();
            this.saveTimeout = null; }, 1000);
    }

    saveGameState() {
        this.storage.saveGameState();
    }

    loadGameState() {
        return this.storage.loadGameState();
    }

    finishGame() {
        if (this.gameFinished) return;
        this.gameFinished = true;
        this.stats.games++;
        this.stats.totalScore += this.score;
        this.stats.totalMoves += this.moves;
        this.stats.totalTime += this.timerSeconds;
        let maxTile = 0;
        for (let r = 0; r < 4; r++)
            for (let c = 0; c < 4; c++)
                if (this.grid[r][c] && this.grid[r][c].value > maxTile) maxTile = this.grid[r][c].value;
        if (maxTile > this.stats.maxTile) this.stats.maxTile = maxTile;
        if (this.gameWon) {
            this.stats.wins++;
            if (this.stats.bestTime === null || this.timerSeconds < this.stats.bestTime)
                this.stats.bestTime = this.timerSeconds;
        }
        this.leaderboard.push({ name: 'Вы', score: this.score });
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        this.storage.saveLeaderboard();
        this.storage.saveStats();
        this.ui.updateStatsDisplay();
        this.checkNewAchievements();
        this.ui.renderAchievements();
        this.saveGameState();
    }

    newGame() {
        if (!this.gameFinished && (this.score > 0 || this.moves > 0)) this.finishGame();
        this.stopTimer();
        this.grid = Array.from({ length: 4 }, () => Array(4).fill(null));
        this.score = 0;
        this.moves = 0;
        this.tileIdCounter = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.winOverlayShown = false;
        this.timerSeconds = 0;
        this.history = [];
        this.gameFinished = false;
        this.tileElements.clear();
        this.undoBtn.disabled = true;
        this.timerDisplay.textContent = '00:00';
        this.scoreDisplay.textContent = '0';
        this.bestDisplay.textContent = this.bestScore;
        this.ui.hideOverlay();
        this.tilesContainer.innerHTML = '';
        this.addRandomTile();
        this.addRandomTile();
        this.ui.renderTiles();
        this.startTimer();
        this.ui.updateStatsDisplay();
        this.ui.renderAchievements();
        this.saveGameState();
    }

    checkNewAchievements() {
        const newUnlocks = this.achievements.filter(a =>
            a.progress() >= a.target && !this.unlockedAchievements.includes(a.id)
        );
        newUnlocks.forEach(a => {
            this.unlockedAchievements.push(a.id);
            this.ui.showAchievementToast(a.name);
        });
        if (newUnlocks.length) {
            this.storage.saveUnlockedAchievements();
            this.ui.renderAchievements();
        }
    }

    applyTheme(theme) {
        if (theme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        this.storage.saveTheme(theme);
        this.ui.renderTiles();
    }

    init() {
        this.storage.loadBestScore();
        this.storage.loadStats();
        if (!localStorage.getItem('leaderboard2048seeded')) {
            const preset = [
                { name: 'MioMuura', score: 13012 }, { name: 'raezu', score: 10040 },
                { name: 'Bot_Neural', score: 8400 }, { name: 'Bot_Omega', score: 7200 },
                { name: 'Bot_Spectre', score: 6500 }, { name: 'Ulvi', score: 5620 }
            ];
            localStorage.setItem('leaderboard2048', JSON.stringify(preset));
            localStorage.setItem('leaderboard2048seeded', '1');
        }
        this.storage.loadLeaderboard();
        this.storage.loadUnlockedAchievements();
        const savedTheme = this.storage.loadTheme();
        this.applyTheme(savedTheme);
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            if (radio.value === savedTheme) radio.checked = true;
            radio.addEventListener('change', (e) => this.applyTheme(e.target.value));
        });
        this.bindEvents();
        if (!this.loadGameState()) this.newGame();
        else {
            this.ui.updateStatsDisplay();
            this.ui.renderAchievements();
            this.ui.renderLeaderboard();
        }
        this.checkNewAchievements();

        // Register Service Worker for PWA functionality
        this.registerServiceWorker();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('ServiceWorker registration successful:', registration.scope);
                    })
                    .catch((error) => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }
    }


    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (isAnyOverlayOpen()) return;
            const dirMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left',
                ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
            if (dirMap[e.key]) { e.preventDefault();
                this.move(dirMap[e.key]); }
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (this.popState()) {
                    this.ui.renderTiles();
                    this.undoBtn.disabled = this.history.length === 0;
                    if (this.gameOver && !this.isGameOver()) { this.gameOver = false;
                        this.startTimer(); }
                    this.ui.hideOverlay();
                }
            }
        });

        let tsx, tsy;
        this.board.addEventListener('touchstart', e => { tsx = e.touches[0].clientX;
            tsy = e.touches[0].clientY; }, { passive: true });
        this.board.addEventListener('touchend', e => {
            if (isAnyOverlayOpen()) return;
            const dx = e.changedTouches[0].clientX - tsx,
                dy = e.changedTouches[0].clientY - tsy;
            // Reduced threshold for better mobile responsiveness
            if (Math.abs(dx) > 15 || Math.abs(dy) > 15)
                this.move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ?
                    'down' : 'up'));
        }, { passive: true });


        let mdx, mdy, mdown = false;
        this.board.addEventListener('mousedown', e => { mdown = true;
            mdx = e.clientX;
            mdy = e.clientY;
            e.preventDefault(); });
        window.addEventListener('mouseup', e => {
            if (!mdown) return;
            mdown = false;
            if (isAnyOverlayOpen()) return;
            const dx = e.clientX - mdx,
                dy = e.clientY - mdy;
            if (Math.abs(dx) > 25 || Math.abs(dy) > 25)
                this.move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ?
                    'down' : 'up'));
        });

        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.undoBtn.addEventListener('click', () => {
            if (this.popState()) {
                this.ui.renderTiles();
                this.undoBtn.disabled = this.history.length === 0;
                if (this.gameOver && !this.isGameOver()) { this.gameOver = false;
                    this.startTimer(); }
                this.ui.hideOverlay();
            }
        });
        this.overlayRestart.addEventListener('click', () => this.newGame());
        this.overlayContinue.addEventListener('click', () => { this.ui.hideOverlay();
            this.winOverlayShown = false; });
        this.overlayClose.addEventListener('click', () => { this.ui.hideOverlay(); });

        this.settingsBtn.addEventListener('click', () => openModal('settingsOverlay'));
        document.querySelectorAll('.settings-item').forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.target;
                closeModal('settingsOverlay');
                switch (target) {
                    case 'themes':
                        openModal('themeOverlay');
                        break;
                    case 'stats':
                        this.ui.updateStatsDisplay();
                        openModal('statsOverlay');
                        break;
                    case 'achievements':
                        this.ui.renderAchievements();
                        openModal('achievementsOverlay');
                        break;
                    case 'leaderboard':
                        this.ui.renderLeaderboard();
                        openModal('leaderboardOverlay');
                        break;
                }
            });
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const overlay = e.target.closest('.modal-overlay');
                if (overlay) closeModal(overlay.id);
            });
        });
        ['themeOverlay', 'statsOverlay', 'achievementsOverlay', 'leaderboardOverlay'].forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('click', (e) => { if (e.target === el) closeModal(id); });
        });

        window.addEventListener('resize', () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => this.ui.renderTiles(), 120);
        });
        window.addEventListener('beforeunload', () => {
            if (!this.gameFinished && (this.score > 0 || this.moves > 0)) this.finishGame();
            this.saveGameState();
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.achievement-cube')) {
                this.ui.tooltip.style.display = 'none';
                clearTimeout(this.ui.tooltip._timeout);
            }
        });
    }
}

// Helper functions
function isAnyOverlayOpen() {
    return document.querySelector('.modal-overlay.show') !== null;
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
    game.board.classList.add('blurred');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    if (!isAnyOverlayOpen()) game.board.classList.remove('blurred');
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game2048();
    game.init();
});