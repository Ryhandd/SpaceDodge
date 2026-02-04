const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const startScreen = document.getElementById("startScreen");
const overlay = document.getElementById("gameOverOverlay");
const finalScoreElement = document.getElementById("finalScore");

let score = 0;
let gameActive = false;
let gameStartedOnce = false;
let enemies = [];
let targetX = 0;
let smoothness = 0.15;

let player = {
    x: 0, y: 0,
    w: 35, h: 35,
    color: '#00c3ff'
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2 - player.w / 2;
    player.y = canvas.height - 100;
    targetX = player.x;
}
window.onresize = resize;
resize();

startScreen.style.display = "block";
overlay.style.display = "none";

function startGame() {
    enemies = []; // Kosongkan musuh sisa
    score = 0;
    if (scoreElement) scoreElement.innerText = "0";
    
    // Pindahkan player ke posisi aman sebelum aktif
    targetX = canvas.width / 2 - player.w / 2;
    player.x = targetX;
    
    startScreen.style.display = "none";
    overlay.style.display = "none";
    canvas.style.cursor = "none";

    // Aktifkan gameActive paling terakhir
    gameActive = true;

    if (!gameStartedOnce) {
        spawnEnemy(); //
        gameStartedOnce = true;
    }
}

// --- PERBAIKI EVENT LISTENER KLIK ---
document.addEventListener('click', () => {
    // Jika game belum aktif dan tidak sedang di layar Game Over
    if (!gameActive && overlay.style.display !== "block") {
        canvas.requestPointerLock();
        // Fungsi startGame akan dipicu oleh pointerlockchange di bawah
    }
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        startGame(); // Mulai game saat kursor terkunci
    } else {
        gameActive = false;
        // Jangan panggil endGame di sini agar tidak memunculkan overlay retry secara paksa
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (gameActive) {
        targetX += e.movementX;
        if (targetX < 0) targetX = 0;
        if (targetX > canvas.width - player.w) targetX = canvas.width - player.w;
    }
});

function spawnEnemy() {
    // HANYA SPAWN JIKA SEDANG MAIN
    if (gameActive) {
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: -50,
            w: 30, h: 30,
            speed: 4 + (score / 15)
        });
    }
    // Cek lagi setiap 1 detik
    setTimeout(spawnEnemy, Math.max(150, 1000 - (score * 10)));
}

function update() {
    if (!gameActive) return;

    // Jalankan auto-pilot jika cheat aktif
    if (typeof cheatEnabled !== 'undefined' && cheatEnabled) {
        runAutoPilot();
    }

    player.x += (targetX - player.x) * smoothness;

    enemies.forEach((en, i) => {
        en.y += en.speed;

        // PROTEKSI: Cek tabrakan HANYA JIKA musuh sudah muncul di layar
        if (en.y + en.h > 0) { 
            if (player.x < en.x + en.w && 
                player.x + player.w > en.x &&
                player.y < en.y + en.h && 
                player.y + player.h > en.y) {
                endGame();
            }
        }

        if (en.y > canvas.height) {
            enemies.splice(i, 1);
            score++;
            if (scoreElement) scoreElement.innerText = score;
        }
    });
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x + 10, player.y + 10, 10, 10);

    // Enemies
    ctx.fillStyle = "#ff4444";
    enemies.forEach(en => ctx.fillRect(en.x, en.y, en.w, en.h));

    update();
    requestAnimationFrame(draw);
}

function endGame() {
    gameActive = false;
    document.exitPointerLock();
    finalScoreElement.innerText = score;
    overlay.style.display = "block";
    canvas.style.cursor = "url('kursor.png'), auto";
}

function resetGame() {
    // Reset posisi ke tengah sebelum lock lagi
    targetX = window.innerWidth / 2 - player.w / 2;
    player.x = targetX;
    canvas.requestPointerLock();
}

draw();