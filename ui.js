class UIManager {
    constructor(game) {
        this.game = game;
        this.tooltip = document.getElementById('achievementTooltip');
        this.toast = document.getElementById('achievementToast');
        this.toastText = document.getElementById('toastText');
    }

    renderTiles(mergedPositions = [], scoreGained = 0) {
        this.game.updateCellSize();
        const cellSize = this.game.cellSize;
        if (cellSize <= 0) return;
        const container = this.game.tilesContainer;
        const gap = 10;
        const newTileMap = new Map();

        for (let r = 0; r < 4; r++)
            for (let c = 0; c < 4; c++) {
                const tile = this.game.grid[r][c];
                if (!tile) continue;
                newTileMap.set(tile.id, { tile, row: r, col: c });
            }

        const toRemove = [];
        this.game.tileElements.forEach((el, id) => { if (!newTileMap.has(id)) toRemove.push(id); });
        toRemove.forEach(id => { const el = this.game.tileElements.get(id);
            el.remove();
            this.game.tileElements.delete(id); });

        newTileMap.forEach((info, id) => {
            const { tile, row, col } = info;
            let el = this.game.tileElements.get(id);
            if (!el) {
                el = document.createElement('div');
                el.className = 'tile';
                container.appendChild(el);
                this.game.tileElements.set(id, el);
            }
            el.className = 'tile';
            if (tile.isNew) el.classList.add('new');
            if (tile.merged) el.classList.add('merged');
            const style = this.getTileStyle(tile.value);
            el.style.width = `${cellSize}px`;
            el.style.height = `${cellSize}px`;
            el.style.background = style.bg;
            el.style.color = style.color;
            el.style.fontSize = tile.value >= 1000 ? '1.6rem' : tile.value >= 100 ? '1.9rem' : '2.2rem';
            el.textContent = tile.value;
            // Use transform: translate3d for GPU acceleration
            el.style.transform = `translate3d(${col * (cellSize + gap)}px, ${row * (cellSize + gap)}px, 0)`;
            tile.isNew = false;
            tile.merged = false;
        });


        if (scoreGained > 0 && mergedPositions.length) {
            const mid = mergedPositions[Math.floor(mergedPositions.length / 2)];
            const popup = document.createElement('div');
            popup.className = 'score-popup';
            popup.textContent = `+${scoreGained}`;
            popup.style.left = `${mid.c * (cellSize + gap) + cellSize / 2 - 24}px`;
            popup.style.top = `${mid.r * (cellSize + gap) - 4}px`;
            container.appendChild(popup);
            setTimeout(() => popup.remove(), 800);
        }

        this.game.scoreDisplay.textContent = this.game.score;
        this.game.bestDisplay.textContent = this.game.bestScore;
    }

    spawnMergeParticles(positions) {
        const container = this.game.tilesContainer;
        const cellSize = this.game.cellSize;
        positions.forEach(pos => {
            const cx = pos.c * (cellSize + 10) + cellSize / 2;
            const cy = pos.r * (cellSize + 10) + cellSize / 2;
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'merge-particle';
                const angle = (Math.PI * 2 * i) / 8;
                const dist = 25 + Math.random() * 20;
                particle.style.cssText = `
                    left: ${cx}px; top: ${cy}px;
                    --dx: ${Math.cos(angle) * dist}px;
                    --dy: ${Math.sin(angle) * dist}px;
                    background: hsl(${40 + Math.random()*20}, 90%, ${55 + Math.random()*20}%);
                    width: ${5 + Math.random()*6}px;
                    height: ${5 + Math.random()*6}px;
                `;
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 600);
            }
        });
    }

    spawnConfetti() {
        const emojis = ['🎉', '✨', '🌟', '💫', '🏆', '👑', '💎', '🎊'];
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'confetti';
                el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                el.style.left = Math.random() * 100 + '%';
                el.style.top = -(20 + Math.random() * 60) + 'px';
                el.style.animationDuration = (2 + Math.random() * 3) + 's';
                el.style.fontSize = (16 + Math.random() * 24) + 'px';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 3500);
            }, i * 40);
        }
    }

    showOverlay(type) {
        this.game.gameOverlay.classList.add('show');
        if (type === 'win') {
            this.game.overlayTitle.textContent = 'Победа!';
            this.game.overlayTitle.style.color = 'var(--accent2)';
            this.game.overlaySub.textContent = `Вы достигли 2048 за ${this.formatTime(this.game.timerSeconds)}`;
            this.game.overlayContinue.style.display = 'inline-block';
            this.game.overlayClose.style.display = 'none';
            this.game.overlayRestart.textContent = 'Новая игра';
            this.game.winOverlayShown = true;
            this.game.gameWon = true;
        } else {
            this.game.overlayTitle.textContent = 'Конец игры';
            this.game.overlayTitle.style.color = 'var(--muted)';
            this.game.overlaySub.textContent = `Счёт: ${this.game.score} | Ходов: ${this.game.moves}`;
            this.game.overlayContinue.style.display = 'none';
            this.game.overlayClose.style.display = 'inline-block';
            this.game.overlayRestart.textContent = 'Заново';
            this.game.gameOver = true;
            if (!this.game.gameFinished) this.game.finishGame();
        }
    }

    hideOverlay() {
        this.game.gameOverlay.classList.remove('show');
        this.game.winOverlayShown = false;
        if (!this.game.gameOver) this.game.startTimer();
    }

    showAchievementToast(name) {
        this.toastText.textContent = `Достижение разблокировано: ${name}`;
        this.toast.classList.add('show');
        setTimeout(() => this.toast.classList.remove('show'), 3200);
    }

    renderAchievements() {
        const container = this.game.achievementsContainer;
        container.innerHTML = '';
        if (!this.game.achievements.length) {
            container.innerHTML =
            '<div style="color:var(--muted);text-align:center;padding:20px;">Нет достижений</div>';
            return;
        }
        const gridEl = document.createElement('div');
        gridEl.className = 'achievements-grid';
        this.game.achievements.forEach(a => {
            const progress = Math.min(a.progress(), a.target);
            const completed = progress >= a.target;
            const cube = document.createElement('div');
            cube.className = 'achievement-cube' + (completed ? '' : ' locked');
            cube.innerHTML = `
                <div class="cube-icon">${a.icon}</div>
                <div class="cube-title">${a.name}</div>
                <div class="achievement-progress"><div class="achievement-fill" style="width:${(progress/a.target)*100}%"></div></div>
            `;
            cube.addEventListener('click', (e) => {
                const rect = cube.getBoundingClientRect();
                this.tooltip.innerHTML =
                    `<div class="tooltip-title">${a.name}</div><div class="tooltip-desc">${a.desc}<br>Прогресс: ${progress}/${a.target}</div>`;
                this.tooltip.style.display = 'block';
                this.tooltip.style.left = `${rect.left + rect.width/2 - this.tooltip.offsetWidth/2}px`;
                this.tooltip.style.top = `${rect.bottom + 8}px`;
                clearTimeout(this.tooltip._timeout);
                this.tooltip._timeout = setTimeout(() => { this.tooltip.style.display = 'none'; },
                    3000);
                e.stopPropagation();
            });
            gridEl.appendChild(cube);
        });
        container.appendChild(gridEl);
    }

    renderLeaderboard() {
        const list = document.getElementById('leaderboardList');
        if (!this.game.leaderboard.length) {
            list.innerHTML =
                '<div style="color:var(--muted);text-align:center;padding:20px;">Нет записей</div>';
            return;
        }
        list.innerHTML = this.game.leaderboard.map((e, i) => `
            <div class="leaderboard-item">
                <span class="leaderboard-rank">#${i+1}</span>
                <span class="leaderboard-name">${e.name||'Аноним'}</span>
                <span class="leaderboard-score">${e.score}</span>
            </div>
        `).join('');
    }

    updateStatsDisplay() {
        document.getElementById('statGames').textContent = this.game.stats.games;
        document.getElementById('statWins').textContent = this.game.stats.wins;
        document.getElementById('statMaxTile').textContent = this.game.stats.maxTile || '-';
        document.getElementById('statTotalScore').textContent = this.game.stats.totalScore;
        document.getElementById('statTotalMoves').textContent = this.game.stats.totalMoves;
        document.getElementById('statBestTime').textContent = this.game.stats.bestTime ? this.formatTime(this.game.stats
            .bestTime) : '--:--';
    }

    getTileStyle(value) {
        const TILE_COLORS = {
            2: { bg: '#2e2e4a', color: '#b0b0d0' },
            4: { bg: '#3a3058', color: '#c8b8e8' },
            8: { bg: '#c06830', color: '#fff' },
            16: { bg: '#d87830', color: '#fff' },
            32: { bg: '#e05040', color: '#fff' },
            64: { bg: '#e03030', color: '#fff' },
            128: { bg: '#f0b820', color: '#fff' },
            256: { bg: '#f0c008', color: '#fff' },
            512: { bg: '#f0d008', color: '#fff' },
            1024: { bg: '#9060e8', color: '#fff' },
            2048: { bg: '#5090f0', color: '#fff' },
            4096: { bg: '#30c8c8', color: '#fff' },
            8192: { bg: '#e840a8', color: '#fff' }
        };
        const LIGHT_TILE_COLORS = {
            2: { bg: '#d8d8e8', color: '#3a3a5c' },
            4: { bg: '#ccc0e8', color: '#3a3050' },
            8: { bg: '#f4a860', color: '#fff' },
            16: { bg: '#f48450', color: '#fff' },
            32: { bg: '#f46450', color: '#fff' },
            64: { bg: '#e84444', color: '#fff' },
            128: { bg: '#f4c830', color: '#fff' },
            256: { bg: '#f4d018', color: '#fff' },
            512: { bg: '#f4dc10', color: '#fff' },
            1024: { bg: '#b488f4', color: '#fff' },
            2048: { bg: '#70a4f4', color: '#fff' },
            4096: { bg: '#50d8d8', color: '#fff' },
            8192: { bg: '#f464b8', color: '#fff' }
        };

        const colors = document.body.classList.contains('light-theme') ? LIGHT_TILE_COLORS : TILE_COLORS;
        return colors[value] || { bg: '#222', color: '#888' };
    }

    formatTime(s) {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }
}