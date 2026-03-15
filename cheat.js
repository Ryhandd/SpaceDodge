// =============================================
//  SPACE DODGE — cheat.js
//  Auto-pilot system
// =============================================

var cheatEnabled = false;

function runAutoPilot() {
    if (typeof gameActive === 'undefined' || !gameActive) return;

    let danger    = null;
    let minDist   = Infinity;

    enemies.forEach(en => {
        const dist = player.y - en.y;
        if (dist > 0 && dist < minDist) {
            minDist = dist;
            danger  = en;
        }
    });

    if (danger) {
        const safeMargin    = 80;
        const playerCenter  = player.x + player.w / 2;
        const enemyCenter   = danger.x + danger.w / 2;
        const playerRight   = player.x + player.w;
        const overlapping   =
            playerRight > danger.x - safeMargin &&
            player.x    < danger.x + danger.w + safeMargin;

        if (overlapping) {
            // Dodge toward the safer side
            const spaceLeft  = danger.x - safeMargin;
            const spaceRight = canvas.width - (danger.x + danger.w + safeMargin);

            if (spaceLeft > spaceRight) {
                targetX -= 55;
            } else {
                targetX += 55;
            }
            targetX = Math.max(0, Math.min(canvas.width - player.w, targetX));
        } else {
            // Gentle centering when no immediate threat
            const centerX = canvas.width / 2 - player.w / 2;
            targetX += (centerX - targetX) * 0.02;
        }
    }
}

// Toggle with 'C' key
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
        cheatEnabled = !cheatEnabled;

        const indicator = document.getElementById("cheat-indicator");
        if (indicator) {
            indicator.style.display = cheatEnabled ? "block" : "none";
        }

        const scoreEl = document.getElementById("score");
        if (scoreEl) {
            scoreEl.style.color      = cheatEnabled ? "#aa00ff" : "#00e5ff";
            scoreEl.style.textShadow = cheatEnabled ? "0 0 15px #aa00ff" : "0 0 15px #00e5ff";
        }

        console.log(`[SPACE DODGE] Auto-pilot: ${cheatEnabled ? "ON" : "OFF"}`);
    }
});