# 🎮 Creature Companion AR

Sebuah pengalaman AR (Augmented Reality) imersif dengan karakter bergaya Palworld/Pokemon menggunakan WebXR dan Three.js.

![Creature Companion AR](https://via.placeholder.com/800x400/1A1B2E/FF6B9D?text=Creature+Companion+AR)

## ✨ Fitur

- 🦊 **6 Karakter Unik** - Pilih dari Fluffox, Bubbird, Leafling, Sparkitty, Aquapup, atau Stardust
- 📱 **WebXR AR** - Pengalaman AR immersive di browser mobile
- 🎨 **Desain Stylish** - UI modern dengan animasi smooth dan efek visual menarik
- 🐾 **Interaksi** - Feed, Pet, dan Play dengan creature Anda
- 🌐 **Fallback Mode** - Demo 3D jika AR tidak tersedia
- 📊 **Stat System** - Track kesehatan dan kebahagiaan creature

## 📁 Struktur Folder

```
ar-creature-app/
├── index.html              # HTML utama dengan UI styling
├── package.json            # Dependencies dan scripts
├── vite.config.js          # Vite configuration
├── README.md               # Dokumentasi ini
├── public/                 # Static assets
│   ├── models/            # 3D models (jika menggunakan GLTF)
│   ├── textures/          # Texture files
│   └── audio/             # Sound effects
├── src/
│   ├── main.js            # Entry point, App controller
│   ├── creatures.js       # Definisi karakter
│   ├── CreatureModel.js   # Generator 3D creature procedural
│   ├── ARScene.js         # WebXR AR scene manager
│   ├── components/        # Komponen UI (untuk pengembangan)
│   ├── utils/             # Helper functions
│   └── styles/            # CSS tambahan
└── assets/                # Development assets
```

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Browser yang support WebXR (Chrome Android 79+, Safari iOS 15+)
- Smartphone dengan kamera

### Instalasi

```bash
# 1. Masuk ke folder project
cd ar-creature-app

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

### Akses Aplikasi

Setelah menjalankan `npm run dev`, Anda akan melihat output seperti:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.x.x:5173/
```

#### Untuk Testing AR di Smartphone:
1. Pastikan smartphone dan komputer dalam jaringan WiFi yang sama
2. Buka URL Network (https://192.168.x.x:5173/) di browser smartphone
3. Accept self-signed certificate warning
4. Pilih creature dan tap "Start AR Adventure"

#### Untuk Testing di Desktop:
- Buka https://localhost:5173/
- Aplikasi akan otomatis masuk ke Fallback Mode (3D viewer)

### Build untuk Production

```bash
npm run build
```

File production akan ada di folder `dist/`.

## 🔧 Konfigurasi

### Mengubah Creature

Edit `src/creatures.js` untuk menambah atau mengubah karakter:

```javascript
{
  id: 'newcreature',
  name: 'New Creature',
  emoji: '🐱',
  description: 'Description here',
  colors: {
    primary: 0xFF6B4A,    // Warna utama (hex)
    secondary: 0xFFB347,  // Warna sekunder
    accent: 0xFFE4B5      // Warna aksen
  },
  personality: 'playful',
  sounds: {
    happy: ['Yay!', '♪'],
    pet: ['Purr~', '❤️'],
    feed: ['Yum!', 'Tasty!']
  }
}
```

### Menambah Fitur Visual Khusus

Edit `CreatureModel.js` method `addSpecialFeatures()`:

```javascript
if (id === 'newcreature') {
  // Tambahkan efek visual khusus
  this.addCustomEffect();
}
```

## 📱 Kompatibilitas

| Platform | Browser | Status |
|----------|---------|--------|
| Android | Chrome 79+ | ✅ Full AR |
| Android | Firefox | ⚠️ Fallback |
| iOS | Safari 15+ | ✅ Full AR (dengan QuickLook) |
| iOS | Chrome | ⚠️ Fallback |
| Desktop | Any | ⚠️ Fallback (3D Viewer) |

## 🎨 Teknologi

- **Three.js** - 3D graphics library
- **WebXR** - AR/VR web standard
- **Vite** - Build tool & dev server
- **Vanilla JS** - No framework dependencies

## 🔮 Pengembangan Selanjutnya

- [ ] Tambah lebih banyak creature
- [ ] Sound effects
- [ ] Particle effects untuk special abilities
- [ ] Multiplayer - lihat creature teman
- [ ] Evolution system
- [ ] Mini games

## 📄 License

MIT License - Free to use and modify

---

Made with ❤️ and ✨ for AR enthusiasts
