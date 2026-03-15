// =============================================
//  VOID RUNNER — script.js
//  Main game logic
// =============================================

const canvas     = document.getElementById("gameCanvas");
const bgCanvas   = document.getElementById("bgCanvas");
const ctx        = canvas.getContext("2d");
const bgCtx      = bgCanvas.getContext("2d");

// UI Elements
const scoreEl        = document.getElementById("score");
const levelEl        = document.getElementById("level-display");
const comboEl        = document.getElementById("combo-display");
const startScreen    = document.getElementById("startScreen");
const overlay        = document.getElementById("gameOverOverlay");
const pauseOverlay   = document.getElementById("pauseOverlay");
const finalScoreEl   = document.getElementById("finalScore");
const finalLevelEl   = document.getElementById("finalLevel");
const finalComboEl   = document.getElementById("finalCombo");
const highScoreEl    = document.getElementById("highScoreDisplay");
const levelUpNotif   = document.getElementById("levelUpNotif");
const cheatIndicator = document.getElementById("cheat-indicator");

// ---- STATE ----
let score          = 0;
let level          = 1;
let combo          = 1;
let maxCombo       = 1;
let highScore      = parseInt(localStorage.getItem("voidrunner_hs") || "0");
let gameActive     = false;
let gamePaused     = false;
let gameStartedOnce = false;
let enemies        = [];
let particles      = [];
let targetX        = 0;
let smoothness     = 0.12;
let frameCount     = 0;

const isMobile = 'ontouchstart' in window;

// ---- PLAYER ----
let player = {
    x: 0, y: 0,
    w: 36, h: 36,
    color: '#00e5ff',
    trail: [],
    tiltX: 0,
    shieldTimer: 0
};

// ---- RESIZE ----
function resize() {
    canvas.width  = bgCanvas.width  = window.innerWidth;
    canvas.height = bgCanvas.height = window.innerHeight;
    player.x = canvas.width / 2 - player.w / 2;
    player.y = canvas.height - 110;
    targetX  = player.x;
    initStars();
}
window.addEventListener("resize", resize);

// ---- STARS (background layer) ----
let stars = [];
function initStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            r: Math.random() * 1.4 + 0.2,
            speed: Math.random() * 0.6 + 0.1,
            opacity: Math.random() * 0.7 + 0.2
        });
    }
}

function drawStars() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Nebula blobs
    const grd1 = bgCtx.createRadialGradient(
        bgCanvas.width * 0.2, bgCanvas.height * 0.3, 10,
        bgCanvas.width * 0.2, bgCanvas.height * 0.3, bgCanvas.width * 0.35
    );
    grd1.addColorStop(0, "rgba(0,50,120,0.08)");
    grd1.addColorStop(1, "transparent");
    bgCtx.fillStyle = grd1;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    const grd2 = bgCtx.createRadialGradient(
        bgCanvas.width * 0.75, bgCanvas.height * 0.6, 10,
        bgCanvas.width * 0.75, bgCanvas.height * 0.6, bgCanvas.width * 0.4
    );
    grd2.addColorStop(0, "rgba(80,0,100,0.07)");
    grd2.addColorStop(1, "transparent");
    bgCtx.fillStyle = grd2;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Stars
    for (let s of stars) {
        if (gameActive) s.y += s.speed * (1 + level * 0.15);
        if (s.y > bgCanvas.height) { s.y = 0; s.x = Math.random() * bgCanvas.width; }

        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(180,220,255,${s.opacity})`;
        bgCtx.fill();
    }
}

// ---- PARTICLES ----
function spawnExplosion(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = Math.random() * 4 + 1.5;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color,
            life: 1,
            decay: Math.random() * 0.03 + 0.02
        });
    }
}

function spawnScoreParticle(x, y, text) {
    particles.push({
        x, y, vx: 0, vy: -1.5,
        text,
        life: 1,
        decay: 0.022,
        isText: true,
        color: '#00e676'
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        if (p.isText) {
            ctx.font = `bold 14px 'Orbitron', monospace`;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillText(p.text, p.x, p.y);
        } else {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        ctx.restore();
    });
}

// ---- DRAW PLAYER (ship shape) ----
function drawPlayer() {
    const px = player.x, py = player.y;
    const pw = player.w, ph = player.h;
    const cx = px + pw / 2;
    const cy = py + ph / 2;

    // Trail
    player.trail.push({ x: cx, y: py + ph });
    if (player.trail.length > 12) player.trail.shift();

    ctx.save();
    player.trail.forEach((pt, i) => {
        const alpha = (i / player.trail.length) * 0.5;
        const size  = (i / player.trail.length) * 6;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 6;
        ctx.fillRect(pt.x - size/2, pt.y, size, 4);
    });
    ctx.restore();

    // Engine glow
    const engineGlow = ctx.createRadialGradient(cx, py + ph, 0, cx, py + ph, 18);
    engineGlow.addColorStop(0, 'rgba(0,229,255,0.6)');
    engineGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = engineGlow;
    ctx.fillRect(cx - 18, py + ph - 6, 36, 24);

    // Ship body
    ctx.save();
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 20;

    // Main body
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(cx,       py);
    ctx.lineTo(cx + 14,  py + ph * 0.75);
    ctx.lineTo(cx + 8,   py + ph);
    ctx.lineTo(cx - 8,   py + ph);
    ctx.lineTo(cx - 14,  py + ph * 0.75);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#010510';
    ctx.beginPath();
    ctx.moveTo(cx,       py + 8);
    ctx.lineTo(cx + 6,   py + ph * 0.5);
    ctx.lineTo(cx - 6,   py + ph * 0.5);
    ctx.closePath();
    ctx.fill();

    // Wing accents
    ctx.fillStyle = 'rgba(0,229,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(cx + 14, py + ph * 0.75);
    ctx.lineTo(cx + 24, py + ph * 0.65);
    ctx.lineTo(cx + 8,  py + ph);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 14, py + ph * 0.75);
    ctx.lineTo(cx - 24, py + ph * 0.65);
    ctx.lineTo(cx - 8,  py + ph);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// ---- DRAW ENEMY (asteroid shape) ----
function drawEnemy(en) {
    ctx.save();
    ctx.translate(en.x + en.w/2, en.y + en.h/2);
    ctx.rotate(en.rot || 0);

    const r = en.w / 2;
    const danger = Math.min(1, (en.y + en.h) / canvas.height);
    const col = en.isLarge
        ? `rgba(255,${Math.floor(100 - danger*60)},0,1)`
        : `rgba(255,${Math.floor(68 - danger*40)},${Math.floor(68 - danger*50)},1)`;

    ctx.shadowColor = col;
    ctx.shadowBlur = 12;

    // Jagged asteroid polygon
    ctx.fillStyle = col;
    ctx.beginPath();
    const points = en.shape || [];
    if (points.length) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.fill();

        // Inner shadow
        ctx.strokeStyle = `rgba(255,255,255,0.12)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    ctx.restore();
}

function makeAsteroidShape(r) {
    const sides = 7 + Math.floor(Math.random() * 4);
    const pts = [];
    for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 / sides) * i;
        const radius = r * (0.7 + Math.random() * 0.5);
        pts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    return pts;
}

// ---- SPAWN ENEMY ----
function spawnEnemy() {
    if (!gameActive) {
        setTimeout(spawnEnemy, 800);
        return;
    }

    const isLarge = Math.random() < 0.15 + level * 0.03;
    const size = isLarge ? 48 + Math.random() * 20 : 24 + Math.random() * 16;

    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size - 10,
        w: size, h: size,
        speed: (isLarge ? 2 : 3.5) + (level * 0.45) + Math.random() * 1.5,
        rot: 0,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        shape: makeAsteroidShape(size / 2),
        isLarge
    });

    const interval = Math.max(120, 1100 - (level * 80) - (score * 5));
    setTimeout(spawnEnemy, interval);
}

// ---- COLLISION ----
function checkCollision(a, b) {
    // Shrink hitbox slightly for fairness
    const margin = 6;
    return (
        a.x + margin < b.x + b.w - margin &&
        a.x + a.w - margin > b.x + margin &&
        a.y + margin < b.y + b.h - margin &&
        a.y + a.h - margin > b.y + margin
    );
}

// ---- UPDATE ----
function update() {
    if (!gameActive || gamePaused) return;
    frameCount++;

    // Auto-pilot
    if (typeof cheatEnabled !== 'undefined' && cheatEnabled) runAutoPilot();

    // Smooth player movement
    player.x += (targetX - player.x) * smoothness;

    // Level up every 10 points
    const newLevel = Math.floor(score / 10) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelEl.innerText = level;
        showLevelUp();
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        en.y += en.speed;
        en.rot += en.rotSpeed;

        // Collision check
        if (en.y > 0 && checkCollision(player, en)) {
            spawnExplosion(player.x + player.w/2, player.y + player.h/2, '#00e5ff', 20);
            spawnExplosion(en.x + en.w/2, en.y + en.h/2, '#ff4444', 16);
            endGame();
            return;
        }

        // Off screen — score + combo
        if (en.y > canvas.height + 10) {
            enemies.splice(i, 1);
            score++;
            combo = Math.min(combo + 1, 8);
            maxCombo = Math.max(maxCombo, combo);

            if (scoreEl) scoreEl.innerText = score;
            updateComboUI();

            spawnScoreParticle(
                en.x + en.w/2,
                canvas.height - 60,
                combo > 1 ? `+1 x${combo}` : '+1'
            );
        }
    }

    updateParticles();
}

// ---- COMBO UI ----
function updateComboUI() {
    comboEl.innerText = `x${combo}`;
    const colors = ['#00e676','#69f0ae','#ffeb3b','#ffa726','#ff5722','#ff1744','#e040fb','#00b0ff'];
    comboEl.style.color = colors[Math.min(combo - 1, colors.length - 1)];
    comboEl.style.textShadow = `0 0 15px ${colors[Math.min(combo - 1, colors.length - 1)]}`;
    comboEl.classList.remove('pop');
    void comboEl.offsetWidth;
    comboEl.classList.add('pop');
}

// ---- DRAW ----
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

    if (gameActive || particles.length > 0) {
        if (gameActive) drawPlayer();
        enemies.forEach(en => drawEnemy(en));
        drawParticles();
    }

    update();
    requestAnimationFrame(draw);
}

// ---- LEVEL UP NOTIF ----
function showLevelUp() {
    levelUpNotif.textContent = `LEVEL ${level}`;
    levelUpNotif.classList.remove('show');
    void levelUpNotif.offsetWidth;
    levelUpNotif.classList.add('show');

    // Screen flash
    canvas.style.filter = 'brightness(2)';
    setTimeout(() => canvas.style.filter = '', 80);
}

// ---- GAME FLOW ----
function startGame() {
    enemies = [];
    particles = [];
    score = 0;
    level = 1;
    combo = 1;
    maxCombo = 1;
    frameCount = 0;
    player.trail = [];

    if (scoreEl) scoreEl.innerText = "0";
    if (levelEl) levelEl.innerText = "1";
    if (comboEl) { comboEl.innerText = "x1"; comboEl.style.color = '#00e676'; }

    targetX = canvas.width / 2 - player.w / 2;
    player.x = targetX;
    player.y = canvas.height - 110;

    startScreen.style.display = "none";
    overlay.style.display     = "none";
    pauseOverlay.style.display = "none";

    if (!isMobile) canvas.style.cursor = "none";
    gameActive = true;

    if (!gameStartedOnce) {
        spawnEnemy();
        gameStartedOnce = true;
    }
}

function endGame() {
    gameActive = false;

    if (!isMobile) document.exitPointerLock();

    // Save high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("voidrunner_hs", highScore);
    }

    finalScoreEl.innerText = score;
    finalLevelEl.innerText = level;
    finalComboEl.innerText = `x${maxCombo}`;
    highScoreEl.innerText  = highScore;

    overlay.style.display = "block";
    if (!isMobile) canvas.style.cursor = "auto";
}

function resetGame() {
    overlay.style.display = "none";
    if (!isMobile) {
        canvas.requestPointerLock();
    } else {
        startGame();
    }
}

function pauseGame() {
    if (!gameActive) return;
    gamePaused = !gamePaused;
    pauseOverlay.style.display = gamePaused ? "block" : "none";
}

function resumeGame() {
    gamePaused = false;
    pauseOverlay.style.display = "none";
    if (!isMobile) canvas.requestPointerLock();
}

// ---- CONTROLS ----
if (isMobile) {
    document.addEventListener('touchstart', (e) => {
        if (!gameActive && overlay.style.display !== "block") startGame();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (gameActive && !gamePaused) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect  = canvas.getBoundingClientRect();
            targetX = touch.clientX - rect.left - player.w / 2;
            targetX = Math.max(0, Math.min(canvas.width - player.w, targetX));
        }
    }, { passive: false });

} else {
    document.addEventListener('click', () => {
        if (!gameActive && overlay.style.display !== "block" && pauseOverlay.style.display !== "block") {
            canvas.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            if (!gameActive) startGame();
            gamePaused = false;
            pauseOverlay.style.display = "none";
        } else {
            if (gameActive) {
                gamePaused = true;
                pauseOverlay.style.display = "block";
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (gameActive && !gamePaused) {
            targetX += e.movementX;
            targetX = Math.max(0, Math.min(canvas.width - player.w, targetX));
        }
    });
}

// ---- KEYBOARD ----
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (gameActive) pauseGame();
    }
});

// ---- INIT ----
resize();
highScoreEl.innerText = highScore;
startScreen.style.display = "block";
overlay.style.display     = "none";
pauseOverlay.style.display = "none";
draw();