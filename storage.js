class StorageManager {
    constructor(game) {
        this.game = game;
    }

    saveGameState() {
        const state = {
            grid: this.game.grid.map(row => row.map(tile => tile ? { id: tile.id, value: tile.value } : null)),
            score: this.game.score,
            moves: this.game.moves,
            timerSeconds: this.game.timerSeconds,
            gameOver: this.game.gameOver,
            gameWon: this.game.gameWon,
            winOverlayShown: this.game.winOverlayShown,
            gameFinished: this.game.gameFinished,
            tileIdCounter: this.game.tileIdCounter
        };
        localStorage.setItem('currentGame', JSON.stringify(state));
    }

    loadGameState() {
        const saved = localStorage.getItem('currentGame');
        if (!saved) return false;
        try {
            const state = JSON.parse(saved);
            this.game.tileElements.clear();
            this.game.grid = state.grid.map(row => row.map(tile => tile ? { ...tile, isNew: false,
                    merged: false } : null));
            this.game.score = state.score;
            this.game.moves = state.moves;
            this.game.timerSeconds = state.timerSeconds;
            this.game.gameOver = state.gameOver;
            this.game.gameWon = state.gameWon;
            this.game.winOverlayShown = state.winOverlayShown;
            this.game.gameFinished = state.gameFinished;
            this.game.tileIdCounter = state.tileIdCounter;
            this.game.timerDisplay.textContent = this.formatTime(this.game.timerSeconds);
            this.game.scoreDisplay.textContent = this.game.score;
            this.game.bestDisplay.textContent = this.game.bestScore;
            this.game.undoBtn.disabled = this.game.history.length === 0;
            this.game.renderTiles();
            if (this.game.winOverlayShown) this.game.showOverlay('win');
            else if (this.game.gameOver) this.game.showOverlay('lose');
            else this.game.startTimer();
            return true;
        } catch (e) {
            return false;
        }
    }

    saveStats() {
        localStorage.setItem('stats2048', JSON.stringify(this.game.stats));
    }

    loadStats() {
        try {
            const s = JSON.parse(localStorage.getItem('stats2048'));
            if (s) Object.assign(this.game.stats, s);
        } catch (e) {}
    }

    saveLeaderboard() {
        localStorage.setItem('leaderboard2048', JSON.stringify(this.game.leaderboard));
    }

    loadLeaderboard() {
        this.game.leaderboard = JSON.parse(localStorage.getItem('leaderboard2048') || '[]');
    }

    saveBestScore() {
        localStorage.setItem('best2048', this.game.bestScore);
    }

    loadBestScore() {
        this.game.bestScore = parseInt(localStorage.getItem('best2048') || '0', 10);
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    loadTheme() {
        return localStorage.getItem('theme') || 'dark';
    }

    saveUnlockedAchievements() {
        localStorage.setItem('unlockedAchievements', JSON.stringify(this.game.unlockedAchievements));
    }

    loadUnlockedAchievements() {
        this.game.unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    }

    formatTime(s) {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }
}