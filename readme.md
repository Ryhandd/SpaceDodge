# 🚀 SPACE DODGE

> *Survive the asteroid field. How long can you last?*

A retro-futuristic arcade dodge game built with vanilla HTML5 Canvas, CSS, and JavaScript — no frameworks, no dependencies.

---

## 🎮 Cara Bermain

Gerakkan pesawatmu untuk menghindari asteroid yang berjatuhan dari atas layar. Semakin banyak asteroid yang berhasil kamu lewatkan, semakin tinggi skor-mu — dan semakin cepat musuh datang!

**Tujuan:** Bertahan selama mungkin. Satu kali kena = Game Over.

---

## 🕹️ Kontrol

| Platform | Aksi | Kontrol |
|---|---|---|
| **Desktop** | Gerak pesawat | Gerakan mouse |
| **Desktop** | Mulai / Retry | Klik |
| **Desktop** | Pause | `ESC` / `P` |
| **Desktop** | Toggle Auto-pilot | `C` |
| **Mobile** | Gerak pesawat | Geser jari |
| **Mobile** | Mulai / Retry | Tap layar |

---

## ✨ Fitur

### Gameplay
- **Level System** — Level naik setiap 10 poin; kecepatan asteroid meningkat setiap level
- **Combo System** — Combo bertambah tiap asteroid yang berhasil dilewati, reset saat Game Over
- **Large Asteroids** — Sesekali muncul asteroid besar yang lebih lambat tapi lebih lebar
- **High Score** — Skor tertinggi tersimpan otomatis di browser (`localStorage`)
- **Hitbox yang Adil** — Hitbox sedikit lebih kecil dari ukuran visual untuk gameplay yang terasa lebih fair

### Visual & Audio
- **Parallax Starfield** — Latar bintang bergerak yang makin cepat sesuai level
- **Nebula Background** — Efek nebula berwarna di latar belakang
- **Particle Explosions** — Ledakan partikel saat tabrakan
- **Score Pop-ups** — Angka skor muncul di layar saat melewati asteroid
- **Ship Trail Effect** — Jejak cahaya di belakang pesawat
- **Engine Glow** — Efek glow di mesin pesawat
- **Level Up Flash** — Efek kilat layar saat naik level
- **Custom Cursor** — Kursor kustom (`kursor.png`)
- **Scanline Overlay** — Efek CRT retro di menu

### UI / UX
- **HUD Real-time** — Score, Level, dan Combo ditampilkan di atas layar
- **Pause Screen** — Game otomatis pause saat pointer lock lepas (kursor keluar jendela)
- **Game Over Stats** — Menampilkan Final Score, Level Reached, Max Combo, dan All-Time High Score
- **Mobile Support** — Mendukung touch control penuh untuk HP/tablet
- **Responsive** — Menyesuaikan ukuran layar apapun

### Cheat / Debug
- **Auto-pilot Mode** — Tekan `C` untuk mengaktifkan. Pesawat menghindari asteroid secara otomatis.  
  Ketika aktif, warna skor berubah jadi ungu dan indikator `⚡ AUTO-PILOT ON` muncul di kanan atas.

---

## 📁 Struktur File

```
void-runner/
├── index.html      # Struktur HTML & overlay screens
├── style.css       # Styling retro-futuristic
├── script.js       # Game logic utama
├── cheat.js        # Auto-pilot system
├── kursor.png      # Custom cursor image
└── README.md       # Dokumentasi ini
```

---

## 🔧 Cara Menjalankan

Tidak perlu build tool atau server khusus. Cukup buka `index.html` di browser modern (Chrome, Firefox, Edge, Safari).

> **Catatan Desktop:** Game menggunakan **Pointer Lock API** agar kursor terkunci di jendela game. Saat kursor keluar, game otomatis pause.

> **Catatan Mobile:** Pointer Lock tidak didukung di HP, jadi kontrol langsung menggunakan touch tanpa locking.

---

## ⚙️ Konfigurasi (script.js)

Kamu bisa menyesuaikan beberapa nilai di bagian atas `script.js`:

```javascript
let smoothness = 0.12;   // Kelancaran gerak pesawat (0.05 = lambat, 0.3 = instan)
```

Dan di `spawnEnemy()`:
```javascript
speed: (isLarge ? 2 : 3.5) + (level * 0.45)  // Kecepatan dasar asteroid
const interval = Math.max(120, 1100 - (level * 80) - (score * 5))  // Interval spawn
```

---

## 🛠️ Tech Stack

- **HTML5 Canvas API** — Rendering game (dual canvas: background + game layer)
- **Vanilla JavaScript** — Game loop, physics, input handling
- **CSS3** — UI, animasi, efek visual
- **Google Fonts** — Orbitron (display) + Share Tech Mono (UI)
- **LocalStorage** — Penyimpanan high score

---

## 📱 Browser Support

| Browser | Desktop | Mobile |
|---|---|---|
| Chrome / Edge | ✅ Full | ✅ Full |
| Firefox | ✅ Full | ✅ Full |
| Safari | ✅ Full | ✅ Full |
| Samsung Internet | — | ✅ Full |
