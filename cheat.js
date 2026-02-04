// cheat.js
var cheatEnabled = false; 

function runAutoPilot() {
    // Jika game belum aktif, jangan lakukan apa-apa
    if (typeof gameActive === 'undefined' || !gameActive) return;

    let danger = null;
    let minDistance = Infinity;

    enemies.forEach(en => {
        let dist = player.y - en.y;
        if (dist > 0 && dist < minDistance) {
            minDistance = dist;
            danger = en;
        }
    });

    if (danger) {
        let safeMargin = 70; 
        if (targetX + player.w > danger.x - safeMargin && targetX < danger.x + danger.w + safeMargin) {
            // Menghindar dengan menggeser targetX
            if (danger.x + (danger.w / 2) > window.innerWidth / 2) {
                targetX -= 50; 
            } else {
                targetX += 50;
            }
        }
    }
}

// Kontrol Tombol 'C'
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
        cheatEnabled = !cheatEnabled;
        
        // Cara aman akses elemen skor
        const sElement = document.getElementById("score");
        if (sElement) {
            sElement.style.color = cheatEnabled ? "#ff00ff" : "#00c3ff";
            // Tambahkan teks (CHEAT) di samping skor agar jelas
            sElement.parentElement.style.textShadow = cheatEnabled ? "0 0 10px #ff00ff" : "none";
        }
        
        console.log("Cheat Status:", cheatEnabled);
    }
});