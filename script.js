/* LABYRINTHX - Advanced Audio Synthesizer, Dual Currencies, Replayable Levels & Milestone System */

// Seeded Random Helper
class SeededRandom {
    constructor(seed = 1) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    range(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

// Rich Web Audio Synthesizer (Footsteps, Pickups, Win, Door Unlock, Milestone)
class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    playStep() {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch(e) {}
    }
    playKeyPickup() {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch(e) {}
    }
    playDoorOpen() {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
        } catch(e) {}
    }
    playWin() {
        if (this.muted || !this.ctx) return;
        try {
            const notes = [293.66, 369.99, 440.00, 554.37, 659.25];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.08);
                osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
            });
        } catch(e) {}
    }
    playMilestoneFanfare() {
        if (this.muted || !this.ctx) return;
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
                gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.5);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.12);
                osc.stop(this.ctx.currentTime + idx * 0.12 + 0.5);
            });
        } catch(e) {}
    }
}

// Procedural Maze Generator with Themes every 20 levels & Extra Hard Daily Mode
class MazeGenerator {
    static generate(level, isDaily = false) {
        let seed = level * 10007;
        if (isDaily) {
            const today = new Date();
            seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        }
        const rng = new SeededRandom(seed);

        // Grid Dimensions: Normal mode scales with level, Daily mode is exceptionally massive & complex
        let cols, rows;
        if (isDaily) {
            cols = 35 + Math.min(20, Math.floor(level / 2));
            rows = cols;
        } else {
            let sizeScalar = Math.floor(Math.pow(level, 0.62) * 2.8);
            cols = 11 + sizeScalar * 2;
            rows = cols;
        }

        if (cols % 2 === 0) cols++;
        if (rows % 2 === 0) rows++;

        const grid = Array(rows).fill().map(() => Array(cols).fill(1)); // 1 = Wall, 0 = Path

        // Dynamic Outer Perimeter Spawns
        const perimeterCells = [];
        for (let r = 1; r < rows - 1; r += 2) {
            perimeterCells.push({ x: 1, y: r });
            perimeterCells.push({ x: cols - 2, y: r });
        }
        for (let c = 1; c < cols - 1; c += 2) {
            perimeterCells.push({ x: c, y: 1 });
            perimeterCells.push({ x: c, y: rows - 2 });
        }

        const startIndex = rng.range(0, perimeterCells.length - 1);
        let endIndex = rng.range(0, perimeterCells.length - 1);
        while (endIndex === startIndex && perimeterCells.length > 1) {
            endIndex = rng.range(0, perimeterCells.length - 1);
        }

        const startPos = perimeterCells[startIndex];
        const endPos = perimeterCells[endIndex];

        // Maze Generation Algorithm with High Turn Frequency
        const stack = [];
        grid[startPos.y][startPos.x] = 0;
        stack.push([startPos.x, startPos.y]);

        const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        let lastDir = null;

        while (stack.length > 0) {
            const [cx, cy] = stack[stack.length - 1];
            const validDirs = [];

            for (let [dx, dy] of dirs) {
                const nx = cx + dx, ny = cy + dy;
                if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
                    validDirs.push([dx, dy]);
                }
            }

            if (validDirs.length > 0) {
                let chosenDir;
                const turnDirs = validDirs.filter(d => !lastDir || (d[0] !== lastDir[0] || d[1] !== lastDir[1]));
                if (turnDirs.length > 0 && rng.next() > 0.25) {
                    chosenDir = turnDirs[rng.range(0, turnDirs.length - 1)];
                } else {
                    chosenDir = validDirs[rng.range(0, validDirs.length - 1)];
                }

                const [dx, dy] = chosenDir;
                grid[cy + dy / 2][cx + dx / 2] = 0;
                grid[cy + dy][cx + dx] = 0;
                lastDir = chosenDir;
                stack.push([cx + dx, cy + dy]);
            } else {
                stack.pop();
                lastDir = null;
            }
        }

        // Additional Dead-ends & Serpentine Twists
        const extraTwists = isDaily ? 60 : Math.min(50, Math.floor(level / 2.5));
        for (let i = 0; i < extraTwists; i++) {
            const rx = rng.range(1, cols - 2);
            const ry = rng.range(1, rows - 2);
            if (grid[ry][rx] === 1) {
                grid[ry][rx] = 0;
            }
        }

        grid[startPos.y][startPos.x] = 0;
        grid[endPos.y][endPos.x] = 0;

        // Key & Locked Doors
        let keyPos = null, doorPos = null;
        if (level >= 5 || isDaily) {
            keyPos = { x: rng.range(1, cols - 2), y: rng.range(1, rows - 2) };
            grid[keyPos.y][keyPos.x] = 0;

            doorPos = {
                x: endPos.x > cols / 2 ? endPos.x - 1 : endPos.x + 1,
                y: endPos.y > rows / 2 ? endPos.y - 1 : endPos.y + 1
            };
            if (doorPos.x > 0 && doorPos.x < cols - 1 && doorPos.y > 0 && doorPos.y < rows - 1) {
                grid[doorPos.y][doorPos.x] = 2; // Locked door
            }
        }

        // Themes change EVERY 20 LEVELS
        const themeIndex = Math.floor((level - 1) / 20) % 6;
        const themes = [
            { name: "NEON CRYSTAL", wall: "#0f172a", wallBorder: "#00f0ff", path: "#050914", accent: "#00f0ff" },
            { name: "EMERALD RUINS", wall: "#062319", wallBorder: "#10b981", path: "#02120c", accent: "#10b981" },
            { name: "PURPLE CYBER", wall: "#210936", wallBorder: "#9d4edd", path: "#0f031b", accent: "#9d4edd" },
            { name: "CYBERPUNK PINK", wall: "#31051e", wallBorder: "#ff007f", path: "#17010e", accent: "#ff007f" },
            { name: "SOLAR GOLD", wall: "#2e2105", wallBorder: "#ffd700", path: "#140e02", accent: "#ffd700" },
            { name: "VOID ECLIPSE", wall: "#1e1b18", wallBorder: "#e2e8f0", path: "#090807", accent: "#ffffff" }
        ];
        const env = themes[themeIndex];

        return {
            grid,
            cols,
            rows,
            startX: startPos.x,
            startY: startPos.y,
            endX: endPos.x,
            endY: endPos.y,
            keyPos,
            doorPos,
            env
        };
    }
}

// 10+ Marketplace Explorer Skins Registry
const MARKETPLACE_SKINS = [
    { id: 'cyan_glow', name: 'Neon Cyan', color: '#00f0ff', desc: 'Standard energetic glass aura', price: 0, currency: 'coins' },
    { id: 'emerald_aura', name: 'Emerald Aura', color: '#10b981', desc: 'Lush green luminous trail', price: 200, currency: 'coins' },
    { id: 'purple_cyber', name: 'Cyber Purple', color: '#9d4edd', desc: 'Deep violet neon pulse', price: 500, currency: 'coins' },
    { id: 'pink_blossom', name: 'Pink Blossom', color: '#ff007f', desc: 'Vibrant hot pink glow', price: 800, currency: 'coins' },
    { id: 'gold_radiance', name: 'Gold Radiance', color: '#ffd700', desc: 'Royal gilded sparkle', price: 1200, currency: 'coins' },
    { id: 'sapphire_blue', name: 'Sapphire Flare', color: '#3b82f6', desc: 'Deep ocean blue aura', price: 1800, currency: 'coins' },
    { id: 'crimson_fire', name: 'Crimson Ember', color: '#ef4444', desc: 'Fiery red particle spark', price: 2500, currency: 'coins' },
    { id: 'sunfire_orange', name: 'Sunfire Pulse', color: '#f97316', desc: 'Blazing solar plasma', price: 3500, currency: 'coins' },
    { id: 'diamond_crystal', name: 'Diamond Crystal', color: '#00e5ff', desc: 'Rare crystalline gem aura', price: 5, currency: 'gems' },
    { id: 'starlight_white', name: 'Starlight Prism', color: '#ffffff', desc: 'Ultra-rare pure white flare', price: 15, currency: 'gems' }
];

// Main Controller Engine
class GameEngine {
    constructor() {
        this.level = 1;
        this.maxUnlockedLevel = 1;
        this.coins = 0;
        this.gems = 0;
        this.totalTimeSpent = 0; // Total accumulated time in seconds across levels
        this.history = [];
        this.unlockedSkins = ['cyan_glow'];
        this.activeSkin = 'cyan_glow';

        this.sound = new SoundManager();
        this.currentMaze = null;
        this.playerPos = { x: 1, y: 1 };
        this.hasKey = false;
        this.timer = 0;
        this.moves = 0;
        this.timerInterval = null;
        this.isDaily = false;
        this.lightMode = localStorage.getItem('labX_light_mode') || 'bright';

        this.loadStorage();
        this.initDOM();
        this.bindEvents();
    }

    loadStorage() {
        this.level = parseInt(localStorage.getItem('labX_level') || '1');
        this.maxUnlockedLevel = parseInt(localStorage.getItem('labX_max_level') || '1');
        this.coins = parseInt(localStorage.getItem('labX_coins') || '100');
        this.gems = parseInt(localStorage.getItem('labX_gems') || '0');
        this.totalTimeSpent = parseInt(localStorage.getItem('labX_total_time') || '0');
        this.history = JSON.parse(localStorage.getItem('labX_history') || '[]');
        this.unlockedSkins = JSON.parse(localStorage.getItem('labX_unlocked_skins') || '["cyan_glow"]');
        this.activeSkin = localStorage.getItem('labX_active_skin') || 'cyan_glow';
        this.updateCoinsUI();
    }

    saveStorage() {
        localStorage.setItem('labX_level', this.level);
        localStorage.setItem('labX_max_level', this.maxUnlockedLevel);
        localStorage.setItem('labX_coins', this.coins);
        localStorage.setItem('labX_gems', this.gems);
        localStorage.setItem('labX_total_time', this.totalTimeSpent);
        localStorage.setItem('labX_history', JSON.stringify(this.history));
        localStorage.setItem('labX_unlocked_skins', JSON.stringify(this.unlockedSkins));
        localStorage.setItem('labX_active_skin', this.activeSkin);
        localStorage.setItem('labX_light_mode', this.lightMode);
    }

    updateCoinsUI() {
        document.getElementById('x-coins-count').innerText = this.coins;
        document.getElementById('x-gems-count').innerText = this.gems;
        document.getElementById('menu-current-level-text').innerText = `LEVEL ${this.level}`;
    }

    initDOM() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        if (this.currentMaze) this.render();
    }

    bindEvents() {
        // Navigation Buttons
        document.getElementById('btn-play').addEventListener('click', () => this.startLevel(this.level));
        document.getElementById('btn-level-select').addEventListener('click', () => this.showScreen('screen-level-select'));
        document.getElementById('btn-daily').addEventListener('click', () => this.startLevel(1, true));
        document.getElementById('btn-history').addEventListener('click', () => this.showScreen('screen-history'));
        document.getElementById('btn-leaderboard').addEventListener('click', () => this.showScreen('screen-leaderboard'));
        document.getElementById('btn-shop').addEventListener('click', () => this.showScreen('screen-shop'));

        // Gameplay Top HUD Back Button
        const gameplayBackBtn = document.getElementById('btn-gameplay-back');
        if (gameplayBackBtn) {
            gameplayBackBtn.addEventListener('click', () => {
                this.stopTimer();
                this.showScreen('screen-main-menu');
            });
        }

        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => this.showScreen('screen-main-menu'));
        });

        // Toggles
        document.getElementById('btn-sound').addEventListener('click', () => {
            this.sound.muted = !this.sound.muted;
            document.getElementById('sound-icon').innerText = this.sound.muted ? '🔇' : '🔊';
        });

        // Complete Modal Actions
        document.getElementById('btn-next-level').addEventListener('click', () => {
            document.getElementById('modal-complete').classList.add('hidden');
            if (this.isDaily) {
                this.showScreen('screen-main-menu');
            } else {
                this.level++;
                if (this.level > this.maxUnlockedLevel) {
                    this.maxUnlockedLevel = this.level;
                }
                this.saveStorage();
                this.startLevel(this.level);
            }
        });

        document.getElementById('btn-complete-menu').addEventListener('click', () => {
            document.getElementById('modal-complete').classList.add('hidden');
            this.showScreen('screen-main-menu');
        });

        // Level 100 Milestone Actions
        document.getElementById('btn-submit-halloffame').addEventListener('click', () => {
            const name = document.getElementById('player-name-input').value.trim();
            if (name) {
                alert(`Thank you, ${name}! You have been registered in the LabyrinthX Hall of Fame.`);
            }
            document.getElementById('modal-milestone-100').classList.add('hidden');
            this.showScreen('screen-main-menu');
        });

        document.getElementById('btn-skip-halloffame').addEventListener('click', () => {
            document.getElementById('modal-milestone-100').classList.add('hidden');
            this.showScreen('screen-main-menu');
        });

        // Desktop Keyboard Controls
        window.addEventListener('keydown', (e) => {
            const gameplayScreen = document.getElementById('screen-gameplay');
            if (!gameplayScreen.classList.contains('active')) return;

            this.sound.init();

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
            }
        });

        // Mobile Swipe Controls
        let touchStartX = 0, touchStartY = 0;
        const overlay = document.getElementById('swipe-overlay');

        overlay.addEventListener('touchstart', (e) => {
            this.sound.init();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        overlay.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 20) {
                if (absDx > absDy) {
                    this.movePlayer(dx > 0 ? 1 : -1, 0);
                } else {
                    this.movePlayer(0, dy > 0 ? 1 : -1);
                }
            }
        }, { passive: true });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        if (screenId === 'screen-level-select') this.renderLevelSelect();
        if (screenId === 'screen-history') this.renderHistory();
        if (screenId === 'screen-leaderboard') this.renderLeaderboard();
        if (screenId === 'screen-shop') this.renderShop();
    }

    startLevel(levelNum, isDaily = false) {
        this.level = levelNum;
        this.isDaily = isDaily;
        this.currentMaze = MazeGenerator.generate(levelNum, isDaily);
        this.playerPos = { x: this.currentMaze.startX, y: this.currentMaze.startY };
        this.hasKey = false;
        this.timer = 0;
        this.moves = 0;

        document.getElementById('hud-level-number').innerText = isDaily ? 'HARD DAILY PUZZLE' : `LEVEL ${levelNum}`;
        document.getElementById('hud-env-name').innerText = this.currentMaze.env.name;
        document.getElementById('hud-moves').innerText = '0';
        document.getElementById('hud-timer').innerText = '00:00';
        document.getElementById('hud-key-slot').innerText = this.currentMaze.keyPos ? '🗝️ x0' : '🗝️ N/A';

        this.showScreen('screen-gameplay');
        this.resizeCanvas();
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.totalTimeSpent++;
            const mins = String(Math.floor(this.timer / 60)).padStart(2, '0');
            const secs = String(this.timer % 60).padStart(2, '0');
            document.getElementById('hud-timer').innerText = `${mins}:${secs}`;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    movePlayer(dx, dy) {
        const nx = this.playerPos.x + dx;
        const ny = this.playerPos.y + dy;
        const grid = this.currentMaze.grid;

        if (nx >= 0 && nx < this.currentMaze.cols && ny >= 0 && ny < this.currentMaze.rows) {
            const tile = grid[ny][nx];

            if (tile === 0) {
                this.playerPos.x = nx;
                this.playerPos.y = ny;
                this.moves++;
                this.sound.playStep();
                document.getElementById('hud-moves').innerText = this.moves;
                this.checkCollisions();
                this.render();
            } else if (tile === 2 && this.hasKey) {
                grid[ny][nx] = 0;
                this.playerPos.x = nx;
                this.playerPos.y = ny;
                this.moves++;
                this.sound.playDoorOpen();
                document.getElementById('hud-moves').innerText = this.moves;
                this.render();
            }
        }
    }

    checkCollisions() {
        if (this.currentMaze.keyPos && this.playerPos.x === this.currentMaze.keyPos.x && this.playerPos.y === this.currentMaze.keyPos.y) {
            this.hasKey = true;
            this.currentMaze.keyPos = null;
            this.sound.playKeyPickup();
            document.getElementById('hud-key-slot').innerText = '🗝️ x1 (UNLOCKED)';
        }

        if (this.playerPos.x === this.currentMaze.endX && this.playerPos.y === this.currentMaze.endY) {
            this.handleLevelComplete();
        }
    }

    handleLevelComplete() {
        this.stopTimer();

        // Calculate Rewards
        const score = Math.max(200, 6000 - (this.timer * 15) - (this.moves * 10) + (this.level * 150));
        const stars = this.timer < 40 ? 3 : (this.timer < 90 ? 2 : 1);
        const earnedCoins = stars * 35 + 25;
        let earnedGems = 0;

        if (this.isDaily) {
            earnedGems = 2; // Daily puzzle gives rare gems
            this.gems += earnedGems;
        }

        this.coins += earnedCoins;
        
        if (!this.isDaily && this.level >= this.maxUnlockedLevel) {
            this.maxUnlockedLevel = this.level + 1;
        }

        this.history.unshift({
            level: this.isDaily ? 'Daily' : this.level,
            time: this.timer,
            moves: this.moves,
            score: score,
            stars: stars,
            date: new Date().toLocaleDateString()
        });

        this.saveStorage();
        this.updateCoinsUI();

        // Check Level 100 Milestone Completion
        if (this.level === 100 && !this.isDaily) {
            this.sound.playMilestoneFanfare();
            const hours = Math.floor(this.totalTimeSpent / 3600);
            const mins = Math.floor((this.totalTimeSpent % 3600) / 60);
            const secs = this.totalTimeSpent % 60;
            document.getElementById('wasted-time-display').innerText = `${hours}h ${mins}m ${secs}s`;
            document.getElementById('modal-milestone-100').classList.remove('hidden');
            return;
        }

        // Standard Win Modal
        this.sound.playWin();
        document.getElementById('complete-level-num').innerText = this.isDaily ? 'HARD DAILY PUZZLE' : `LEVEL ${this.level}`;
        document.getElementById('complete-time').innerText = `${this.timer}s`;
        document.getElementById('complete-moves').innerText = this.moves;
        document.getElementById('complete-score').innerText = score;
        document.getElementById('complete-coins').innerText = `+${earnedCoins} 🪙 ${earnedGems > 0 ? `+${earnedGems} 💎` : ''}`;

        for (let i = 1; i <= 3; i++) {
            const starEl = document.getElementById(`star-${i}`);
            if (i <= stars) starEl.classList.add('active');
            else starEl.classList.remove('active');
        }

        document.getElementById('modal-complete').classList.remove('hidden');
    }

    renderLevelSelect() {
        const container = document.getElementById('level-grid-container');
        let html = '';
        const totalDisplayLevels = Math.max(20, this.maxUnlockedLevel + 5);

        for (let i = 1; i <= totalDisplayLevels; i++) {
            const isUnlocked = i <= this.maxUnlockedLevel;
            const historyRecord = this.history.find(h => h.level === i);
            const starsText = historyRecord ? '★'.repeat(historyRecord.stars) : '';

            if (isUnlocked) {
                html += `
                    <button class="level-btn" onclick="window.game.startLevel(${i})">
                        <span>L${i}</span>
                        <span class="level-stars">${starsText || 'Unlocked'}</span>
                    </button>
                `;
            } else {
                html += `
                    <button class="level-btn locked" disabled>
                        <span>🔒</span>
                        <span class="level-stars">L${i}</span>
                    </button>
                `;
            }
        }
        container.innerHTML = html;
    }

    renderShop() {
        const container = document.getElementById('shop-items-container');
        container.innerHTML = MARKETPLACE_SKINS.map(skin => {
            const isUnlocked = this.unlockedSkins.includes(skin.id);
            const isActive = this.activeSkin === skin.id;

            let buttonHtml = '';
            if (isActive) {
                buttonHtml = `<button class="btn btn-primary glass-btn" style="padding:6px 12px; font-size:0.8rem;" disabled>EQUIPPED</button>`;
            } else if (isUnlocked) {
                buttonHtml = `<button class="btn btn-secondary glass-btn" style="padding:6px 12px; font-size:0.8rem;" onclick="window.game.equipSkin('${skin.id}')">EQUIP</button>`;
            } else {
                const currencyIcon = skin.currency === 'gems' ? '💎' : '🪙';
                buttonHtml = `<button class="btn btn-tertiary glass-btn" style="padding:6px 12px; font-size:0.8rem;" onclick="window.game.buySkin('${skin.id}')">BUY ${skin.price} ${currencyIcon}</button>`;
            }

            return `
                <div class="shop-card">
                    <div class="skin-info">
                        <div class="skin-preview-dot" style="background:${skin.color}; color:${skin.color};"></div>
                        <div class="skin-details">
                            <strong>${skin.name}</strong>
                            <p>${skin.desc}</p>
                        </div>
                    </div>
                    <div>${buttonHtml}</div>
                </div>
            `;
        }).join('');
    }

    equipSkin(skinId) {
        if (this.unlockedSkins.includes(skinId)) {
            this.activeSkin = skinId;
            this.saveStorage();
            this.renderShop();
            if (this.currentMaze) this.render();
        }
    }

    buySkin(skinId) {
        const skin = MARKETPLACE_SKINS.find(s => s.id === skinId);
        if (!skin) return;

        if (skin.currency === 'coins' && this.coins >= skin.price) {
            this.coins -= skin.price;
            this.unlockedSkins.push(skinId);
            this.activeSkin = skinId;
            this.saveStorage();
            this.updateCoinsUI();
            this.renderShop();
        } else if (skin.currency === 'gems' && this.gems >= skin.price) {
            this.gems -= skin.price;
            this.unlockedSkins.push(skinId);
            this.activeSkin = skinId;
            this.saveStorage();
            this.updateCoinsUI();
            this.renderShop();
        } else {
            alert(`Not enough ${skin.currency}! Complete more labyrinths or daily puzzles.`);
        }
    }

    render() {
        if (!this.currentMaze) return;

        const ctx = this.ctx;
        const { grid, cols, rows, env } = this.currentMaze;
        const cellW = this.canvas.width / cols;
        const cellH = this.canvas.height / rows;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Walls & Paths
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * cellW;
                const y = r * cellH;

                if (grid[r][c] === 1) {
                    ctx.fillStyle = env.wall;
                    ctx.fillRect(x, y, cellW, cellH);
                    ctx.strokeStyle = env.wallBorder;
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
                } else if (grid[r][c] === 0) {
                    ctx.fillStyle = env.path;
                    ctx.fillRect(x, y, cellW, cellH);
                } else if (grid[r][c] === 2) {
                    ctx.fillStyle = '#ff007f';
                    ctx.fillRect(x, y, cellW, cellH);
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(x + cellW * 0.3, y + cellH * 0.3, cellW * 0.4, cellH * 0.4);
                }
            }
        }

        // Render Key
        if (this.currentMaze.keyPos) {
            const kx = this.currentMaze.keyPos.x * cellW + cellW / 2;
            const ky = this.currentMaze.keyPos.y * cellH + cellH / 2;
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(kx, ky, Math.min(cellW, cellH) * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Render Exit Goal Portal
        const ex = this.currentMaze.endX * cellW + cellW / 2;
        const ey = this.currentMaze.endY * cellH + cellH / 2;
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ex, ey, Math.min(cellW, cellH) * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Render Active Skin Player Avatar
        const px = this.playerPos.x * cellW + cellW / 2;
        const py = this.playerPos.y * cellH + cellH / 2;
        const skin = MARKETPLACE_SKINS.find(s => s.id === this.activeSkin) || MARKETPLACE_SKINS[0];
        ctx.fillStyle = skin.color;
        ctx.shadowColor = skin.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(px, py, Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    renderHistory() {
        const container = document.getElementById('history-list');
        if (this.history.length === 0) {
            container.innerHTML = '<p style="color:var(--text-dim);">No completed labyrinths yet.</p>';
            return;
        }
        container.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div>
                    <strong>LEVEL ${item.level}</strong> - ${item.date}<br>
                    <small style="color:var(--text-dim);">⏱️ ${item.time}s | 👣 ${item.moves} moves</small>
                </div>
                <div style="text-align:right;">
                    <span style="color:var(--gold-bright);">${'★'.repeat(item.stars)}</span><br>
                    <strong style="color:var(--cyan-glow);">${item.score} pts</strong>
                </div>
            </div>
        `).join('');
    }

    renderLeaderboard() {
        const container = document.getElementById('leaderboard-list');
        const mockScores = [
            { rank: '🥇', name: 'CyberRunner', time: '12.4s', score: '4950' },
            { rank: '🥈', name: 'NeonGrid', time: '15.1s', score: '4800' },
            { rank: '🥉', name: 'GlassMaster', time: '18.3s', score: '4650' },
            { rank: '4', name: 'MazeHacker', time: '21.0s', score: '4400' }
        ];
        container.innerHTML = mockScores.map(item => `
            <div class="leaderboard-item">
                <div>
                    <span>${item.rank}</span> <strong>${item.name}</strong>
                </div>
                <div>
                    <span>${item.time}</span> | <strong style="color:var(--cyan-glow);">${item.score}</strong>
                </div>
            </div>
        `).join('');
    }
}

// Launch Engine on Load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
