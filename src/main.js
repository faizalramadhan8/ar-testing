import { ghosts } from './ghosts.js';
import { ARScene } from './ARScene.js';
import { LocationManager } from './LocationManager.js';
import { Collection } from './Collection.js';
import { HuntMap } from './HuntMap.js';
import { AudioManager } from './AudioManager.js';

class App {
  constructor() {
    this.arScene = null;
    this.currentGhost = null;
    this.collection = new Collection();
    this.locationManager = new LocationManager();
    this.huntMap = null;
    this.devMode = false;

    this.audio = new AudioManager();

    // Debounce state for shoot button
    this._shootLocked = false;
    this._shootDebounceMs = 350;

    this.init();
  }

  async init() {
    await this.waitForDOM();
    this.cacheElements();
    this.bindEvents();
    this.setupHuntMap();
    this.updateCollectionStats();

    await this.initLocation();

    setTimeout(() => {
      this.elements.loadingScreen.classList.add('hidden');
      this.elements.huntScreen.classList.add('visible');
    }, 1500);
  }

  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve);
    });
  }

  cacheElements() {
    this.elements = {
      loadingScreen: document.getElementById('loading-screen'),
      huntScreen: document.getElementById('hunt-screen'),
      collectionScreen: document.getElementById('collection-screen'),
      ghostList: document.getElementById('ghost-list'),
      statCaptured: document.getElementById('stat-captured'),
      statTotal: document.getElementById('stat-total'),
      openCollection: document.getElementById('open-collection'),
      closeCollection: document.getElementById('close-collection'),
      collectionGrid: document.getElementById('collection-grid'),
      collectionCount: document.getElementById('collection-count'),
      arContainer: document.getElementById('ar-container'),
      battleHud: document.getElementById('battle-hud'),
      ghostAvatar: document.getElementById('ghost-avatar'),
      ghostName: document.getElementById('ghost-name'),
      ghostHpBar: document.getElementById('ghost-hp-bar'),
      ghostHpText: document.getElementById('ghost-hp-text'),
      ghostHpTrack: document.querySelector('.ghost-hp-track'),
      crosshair: document.getElementById('crosshair'),
      btnShoot: document.getElementById('btn-shoot'),
      btnFlee: document.getElementById('btn-flee'),
      battleBackBtn: document.getElementById('battle-back-btn'),
      instructionOverlay: document.getElementById('instruction-overlay'),
      captureOverlay: document.getElementById('capture-overlay'),
      capturedGhostName: document.getElementById('captured-ghost-name'),
      captureContinue: document.getElementById('capture-continue'),
      modeBanner: document.getElementById('mode-banner'),
      toast: document.getElementById('toast'),
      errorScreen: document.getElementById('error-screen'),
      devModeBtn: document.getElementById('dev-mode-btn'),
      screenFlash: document.getElementById('screen-flash'),
    };
  }

  bindEvents() {
    this.elements.openCollection.addEventListener('click', () => this.showCollection());
    this.elements.closeCollection.addEventListener('click', () => this.hideCollection());
    this.elements.btnShoot.addEventListener('click', (e) => {
      e.preventDefault();
      this.shoot();
    });
    // Prevent double-tap zoom and multi-fire on touch
    this.elements.btnShoot.addEventListener('touchend', (e) => {
      e.preventDefault();
    });
    this.elements.btnFlee.addEventListener('click', () => this.fleeBattle());
    this.elements.battleBackBtn.addEventListener('click', () => this.fleeBattle());
    this.elements.captureContinue.addEventListener('click', () => this.finishCapture());

    this.elements.devModeBtn.addEventListener('click', () => this.toggleDevMode());

    document.addEventListener('keydown', (e) => {
      if (e.key === '`') this.toggleDevMode();
    });
  }

  toggleDevMode() {
    this.devMode = !this.devMode;
    this.showToast(this.devMode ? 'Mode Test: ON — semua hantu bisa diburu' : 'Mode Test: OFF', '');
    this.elements.devModeBtn.style.opacity = this.devMode ? '1' : '0.6';
    if (this.devMode && this.huntMap) {
      this.huntMap.enableDevMode();
    } else if (this.huntMap) {
      this.huntMap.render();
    }
  }

  setupHuntMap() {
    this.huntMap = new HuntMap(
      this.elements.ghostList,
      this.collection,
      this.locationManager,
      { onHunt: (ghost) => this.startBattle(ghost) }
    );
    this.huntMap.render();
  }

  async initLocation() {
    if (!this.locationManager.isSupported()) {
      this.showToast('GPS tidak tersedia', '');
      if (this.huntMap) this.huntMap.enableDevMode();
      this.devMode = true;
      return;
    }

    try {
      await this.locationManager.getCurrentPosition();
      this.huntMap.update();

      this.locationManager.watchPosition(() => {
        if (this.elements.huntScreen.classList.contains('visible')) {
          this.huntMap.update();
        }
      });
    } catch {
      this.showToast('Izinkan akses GPS untuk berburu', '');
      if (this.huntMap) this.huntMap.enableDevMode();
      this.devMode = true;
    }
  }

  // === BATTLE ===

  async startBattle(ghost) {
    this.currentGhost = ghost;
    this.elements.huntScreen.classList.remove('visible');

    // Initialize audio on user gesture
    this.audio.init();

    this.updateBattleHUD(ghost);

    try {
      this.arScene = new ARScene(
        this.elements.arContainer,
        ghost,
        {
          onGhostSpawned: () => this.onGhostSpawned(),
          onFallback: () => this.onFallback(),
        }
      );

      await this.arScene.init();
      this.elements.battleHud.classList.add('visible');

    } catch (error) {
      console.error('AR init failed:', error);
      this.returnToHunt();
    }
  }

  updateBattleHUD(ghost) {
    this.elements.ghostAvatar.style.background = ghost.gradient;
    this.elements.ghostAvatar.innerHTML = ghost.icon;
    this.elements.ghostName.textContent = ghost.name;
    this.updateHPBar(ghost.hp, ghost.hp);
  }

  updateHPBar(hp, maxHp) {
    const pct = Math.max(0, (hp / maxHp) * 100);
    this.elements.ghostHpBar.style.width = `${pct}%`;
    this.elements.ghostHpText.textContent = `HP: ${Math.ceil(hp)} / ${maxHp}`;

    if (pct < 25) {
      this.elements.ghostHpBar.style.background = 'linear-gradient(90deg, #E74C3C, #C0392B)';
    } else if (pct < 50) {
      this.elements.ghostHpBar.style.background = 'linear-gradient(90deg, #E67E22, #D35400)';
    } else {
      this.elements.ghostHpBar.style.background = 'linear-gradient(90deg, #E74C3C, #E67E22)';
    }
  }

  onGhostSpawned() {
    // Play ghost appear sound
    this.audio.playGhostAppear();

    const sound = this.currentGhost.sounds.appear[
      Math.floor(Math.random() * this.currentGhost.sounds.appear.length)
    ];
    this.showToast(sound, '');
  }

  onFallback() {
    this.elements.modeBanner.classList.add('visible');
  }

  shoot() {
    if (!this.arScene || !this.currentGhost) return;

    // Debounce at the UI level to prevent multi-tap
    if (this._shootLocked) return;
    this._shootLocked = true;
    setTimeout(() => { this._shootLocked = false; }, this._shootDebounceMs);

    // Play shoot sound immediately for responsiveness
    this.audio.playShoot();

    // Muzzle flash on button
    this.elements.btnShoot.classList.add('muzzle-flash');
    setTimeout(() => this.elements.btnShoot.classList.remove('muzzle-flash'), 150);

    const result = this.arScene.shoot();

    if (result.cooldown) return; // engine-level cooldown, already played sound which is fine

    if (result.hit) {
      // Audio
      this.audio.playHit();

      // Crosshair hit feedback
      this.elements.crosshair.classList.add('hit');
      setTimeout(() => this.elements.crosshair.classList.remove('hit'), 300);

      // Update HP bar
      this.updateHPBar(result.hp, result.maxHp);

      // Flash HP bar red
      this._flashHPBar();

      // Screen flash overlay
      this._screenFlash('#ff000040');

      // Floating damage number
      this._showDamageNumber(result.damage);

      // Toast with ghost sound
      const sound = this.currentGhost.sounds.hit[
        Math.floor(Math.random() * this.currentGhost.sounds.hit.length)
      ];
      this.showToast(sound, '');

      // Vibrate
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

      if (result.dead) {
        this.onGhostDefeated();
      }
    } else {
      // Miss feedback
      this.audio.playMiss();
      this._showMissText();
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }

  /** Flash the HP bar track to indicate damage */
  _flashHPBar() {
    const track = this.elements.ghostHpTrack;
    if (!track) return;
    track.classList.add('hp-flash');
    setTimeout(() => track.classList.remove('hp-flash'), 300);
  }

  /** Show a screen-edge flash overlay */
  _screenFlash(color) {
    const el = this.elements.screenFlash;
    if (!el) return;
    el.style.background = `radial-gradient(ellipse at center, transparent 40%, ${color} 100%)`;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 200);
  }

  /** Floating damage number that rises and fades */
  _showDamageNumber(damage) {
    const el = document.createElement('div');
    el.className = 'floating-damage';
    el.textContent = `-${damage}`;

    // Randomize horizontal position slightly
    const offsetX = (Math.random() - 0.5) * 60;
    el.style.left = `calc(50% + ${offsetX}px)`;

    document.body.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => el.classList.add('animate'));

    setTimeout(() => {
      el.remove();
    }, 800);
  }

  /** Show MISS text when shot misses */
  _showMissText() {
    const el = document.createElement('div');
    el.className = 'floating-miss';
    el.textContent = 'MISS!';

    const offsetX = (Math.random() - 0.5) * 40;
    el.style.left = `calc(50% + ${offsetX}px)`;

    document.body.appendChild(el);

    requestAnimationFrame(() => el.classList.add('animate'));

    setTimeout(() => {
      el.remove();
    }, 700);
  }

  onGhostDefeated() {
    this.elements.btnShoot.style.display = 'none';

    // Play capture sound
    this.audio.playCapture();

    this.arScene.captureGhost(() => {
      this.collection.add(this.currentGhost.id);

      const sound = this.currentGhost.sounds.captured[
        Math.floor(Math.random() * this.currentGhost.sounds.captured.length)
      ];
      this.showToast(sound, '');

      // Screen flash for capture (purple / mystic)
      this._screenFlash('#9B59B660');

      this.elements.capturedGhostName.textContent = this.currentGhost.name;
      this.elements.captureOverlay.classList.add('visible');
    });
  }

  finishCapture() {
    this.elements.captureOverlay.classList.remove('visible');
    this.elements.btnShoot.style.display = '';
    this.returnToHunt();
  }

  fleeBattle() {
    if (this.arScene && this.arScene.ghostModel && !this.arScene.ghostModel.isDead) {
      this.returnToHunt();
    } else {
      this.returnToHunt();
    }
  }

  returnToHunt() {
    this.elements.battleHud.classList.remove('visible');
    this.elements.modeBanner.classList.remove('visible');

    if (this.arScene) {
      this.arScene.dispose();
      this.arScene = null;
    }

    this.currentGhost = null;
    this._shootLocked = false;
    this.updateCollectionStats();
    this.huntMap.render();

    if (this.devMode) {
      this.huntMap.enableDevMode();
    }

    this.elements.huntScreen.classList.add('visible');
  }

  // === COLLECTION ===

  showCollection() {
    this.elements.huntScreen.classList.remove('visible');
    this.renderCollectionGrid();
    this.elements.collectionScreen.classList.add('visible');
  }

  hideCollection() {
    this.elements.collectionScreen.classList.remove('visible');
    this.elements.huntScreen.classList.add('visible');
  }

  renderCollectionGrid() {
    const grid = this.elements.collectionGrid;
    grid.innerHTML = '';

    ghosts.forEach(ghost => {
      const captured = this.collection.has(ghost.id);
      const entry = this.collection.get(ghost.id);

      const card = document.createElement('div');
      card.className = `collection-card ${captured ? 'captured' : 'unknown'}`;

      const dateStr = entry
        ? new Date(entry.capturedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

      card.innerHTML = `
        <div class="collection-card-avatar" style="background: ${captured ? ghost.gradient : 'rgba(255,255,255,0.05)'}">
          ${captured ? ghost.icon : '<svg viewBox="0 0 64 64"><text x="32" y="40" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-size="24">?</text></svg>'}
        </div>
        <div class="collection-card-name">${captured ? ghost.name : '???'}</div>
        <div class="collection-card-date">${captured ? dateStr : 'Belum ditemukan'}</div>
      `;

      grid.appendChild(card);
    });

    const stats = this.collection.getStats();
    this.elements.collectionCount.textContent = `${stats.total} / ${ghosts.length} hantu tertangkap`;
  }

  updateCollectionStats() {
    const stats = this.collection.getStats();
    this.elements.statCaptured.textContent = stats.total;
    this.elements.statTotal.textContent = ghosts.length;
  }

  // === UTILS ===

  showToast(message, icon = '') {
    const toast = this.elements.toast;
    const iconEl = toast.querySelector('.toast-icon');
    const textEl = toast.querySelector('.toast-text');

    iconEl.textContent = icon;
    textEl.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => toast.classList.remove('visible'), 2000);
  }
}

const app = new App();
