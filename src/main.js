import { ghosts } from './ghosts.js';
import { ARScene } from './ARScene.js';
import { LocationManager } from './LocationManager.js';
import { Collection } from './Collection.js';
import { HuntMap } from './HuntMap.js';

class App {
  constructor() {
    this.arScene = null;
    this.currentGhost = null;
    this.collection = new Collection();
    this.locationManager = new LocationManager();
    this.huntMap = null;
    this.devMode = false;

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
    };
  }

  bindEvents() {
    this.elements.openCollection.addEventListener('click', () => this.showCollection());
    this.elements.closeCollection.addEventListener('click', () => this.hideCollection());
    this.elements.btnShoot.addEventListener('click', () => this.shoot());
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

    const result = this.arScene.shoot();

    if (result.hit) {
      this.elements.crosshair.classList.add('hit');
      setTimeout(() => this.elements.crosshair.classList.remove('hit'), 200);

      this.updateHPBar(result.hp, result.maxHp);

      const sound = this.currentGhost.sounds.hit[
        Math.floor(Math.random() * this.currentGhost.sounds.hit.length)
      ];
      this.showToast(sound, '');

      if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

      if (result.dead) {
        this.onGhostDefeated();
      }
    } else {
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }

  onGhostDefeated() {
    this.elements.btnShoot.style.display = 'none';

    this.arScene.captureGhost(() => {
      this.collection.add(this.currentGhost.id);

      const sound = this.currentGhost.sounds.captured[
        Math.floor(Math.random() * this.currentGhost.sounds.captured.length)
      ];
      this.showToast(sound, '');

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
