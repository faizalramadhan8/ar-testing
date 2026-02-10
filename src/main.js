import { creatures, getCreatureById } from './creatures.js';
import { ARScene } from './ARScene.js';

class App {
  constructor() {
    this.selectedCreature = null;
    this.arScene = null;
    this.creatureStats = {
      health: 100,
      happiness: 80
    };
    
    this.init();
  }

  async init() {
    // Wait for DOM
    await this.waitForDOM();
    
    // Cache DOM elements
    this.cacheElements();
    
    // Build creature selection grid
    this.buildCreatureGrid();
    
    // Bind events
    this.bindEvents();
    
    // Hide loading, show start screen
    setTimeout(() => {
      this.elements.loadingScreen.classList.add('hidden');
      this.elements.startScreen.classList.add('visible');
    }, 1500);
  }

  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }

  cacheElements() {
    this.elements = {
      loadingScreen: document.getElementById('loading-screen'),
      startScreen: document.getElementById('start-screen'),
      creatureGrid: document.getElementById('creature-grid'),
      startBtn: document.getElementById('start-btn'),
      arContainer: document.getElementById('ar-container'),
      arHud: document.getElementById('ar-hud'),
      hudAvatar: document.getElementById('hud-avatar'),
      hudName: document.getElementById('hud-name'),
      healthBar: document.getElementById('health-bar'),
      happinessBar: document.getElementById('happiness-bar'),
      instructionOverlay: document.getElementById('instruction-overlay'),
      modeBanner: document.getElementById('mode-banner'),
      toast: document.getElementById('toast'),
      errorScreen: document.getElementById('error-screen'),
      btnFeed: document.getElementById('btn-feed'),
      btnPet: document.getElementById('btn-pet'),
      btnPlay: document.getElementById('btn-play'),
      menuBtn: document.getElementById('menu-btn')
    };
  }

  buildCreatureGrid() {
    const grid = this.elements.creatureGrid;
    grid.innerHTML = '';

    creatures.forEach(creature => {
      const card = document.createElement('div');
      card.className = 'creature-card';
      card.dataset.id = creature.id;
      
      card.innerHTML = `
        <div class="creature-check">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <div class="creature-avatar" style="background: ${creature.gradient}">
          ${creature.icon}
        </div>
        <span class="creature-name">${creature.name}</span>
      `;
      
      card.addEventListener('click', () => this.selectCreature(creature.id));
      grid.appendChild(card);
    });
  }

  selectCreature(id) {
    // Update selection state
    this.selectedCreature = getCreatureById(id);
    
    // Update UI
    document.querySelectorAll('.creature-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.id === id);
    });
    
    // Enable start button
    this.elements.startBtn.disabled = false;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  bindEvents() {
    // Start button
    this.elements.startBtn.addEventListener('click', () => this.startAR());
    
    // Action buttons
    this.elements.btnFeed.addEventListener('click', () => this.feedCreature());
    this.elements.btnPet.addEventListener('click', () => this.petCreature());
    this.elements.btnPlay.addEventListener('click', () => this.playWithCreature());
    
    // Menu button
    this.elements.menuBtn.addEventListener('click', () => this.openMenu());
  }

  async startAR() {
    if (!this.selectedCreature) return;
    
    // Hide start screen
    this.elements.startScreen.classList.remove('visible');
    
    // Update HUD with selected creature
    this.updateHUD();
    
    // Initialize AR Scene
    try {
      this.arScene = new ARScene(
        this.elements.arContainer,
        this.selectedCreature,
        {
          onPlaced: () => this.onCreaturePlaced(),
          onError: (error) => this.onARError(error)
        }
      );
      
      await this.arScene.init();
      
      // Show HUD
      this.elements.arHud.classList.add('visible');
      
    } catch (error) {
      console.error('AR initialization failed:', error);
      this.onARError(error);
    }
  }

  updateHUD() {
    if (!this.selectedCreature) return;
    
    // Set avatar
    this.elements.hudAvatar.style.background = this.selectedCreature.gradient;
    this.elements.hudAvatar.innerHTML = this.selectedCreature.icon;
    
    // Set name
    this.elements.hudName.textContent = this.selectedCreature.name;
    
    // Set stats
    this.updateStats();
  }

  updateStats() {
    this.elements.healthBar.style.width = `${this.creatureStats.health}%`;
    this.elements.happinessBar.style.width = `${this.creatureStats.happiness}%`;
  }

  onCreaturePlaced() {
    // Hide instruction overlay
    this.elements.instructionOverlay.style.display = 'none';
    
    // Show toast
    this.showToast(`${this.selectedCreature.name} appeared!`, '✨');
  }

  onARError(error) {
    console.error('AR Error:', error);
    
    // Check if fallback mode
    if (this.arScene && this.arScene.isFallbackMode) {
      this.elements.modeBanner.classList.add('visible');
      this.elements.instructionOverlay.style.display = 'none';
    }
  }

  feedCreature() {
    if (!this.arScene || !this.arScene.creatureModel) return;
    
    // Trigger eating animation
    this.arScene.creatureModel.playEatingAnimation();
    
    // Update stats
    this.creatureStats.health = Math.min(100, this.creatureStats.health + 15);
    this.creatureStats.happiness = Math.min(100, this.creatureStats.happiness + 5);
    this.updateStats();
    
    // Show toast
    const sound = this.selectedCreature.sounds.feed[
      Math.floor(Math.random() * this.selectedCreature.sounds.feed.length)
    ];
    this.showToast(sound, '🍎');
    
    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate([20, 50, 20]);
    }
  }

  petCreature() {
    if (!this.arScene || !this.arScene.creatureModel) return;
    
    // Trigger love animation
    this.arScene.creatureModel.playLoveAnimation();
    
    // Update stats
    this.creatureStats.happiness = Math.min(100, this.creatureStats.happiness + 20);
    this.updateStats();
    
    // Show toast
    const sound = this.selectedCreature.sounds.pet[
      Math.floor(Math.random() * this.selectedCreature.sounds.pet.length)
    ];
    this.showToast(sound, '💕');
    
    // Spawn floating emojis
    this.spawnFloatingEmojis(['💕', '💖', '💗', '✨']);
    
    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate([30, 30, 30, 30, 50]);
    }
  }

  playWithCreature() {
    if (!this.arScene || !this.arScene.creatureModel) return;
    
    // Trigger play animation
    this.arScene.creatureModel.playPlayAnimation();
    
    // Update stats
    this.creatureStats.happiness = Math.min(100, this.creatureStats.happiness + 15);
    this.creatureStats.health = Math.max(0, this.creatureStats.health - 5);
    this.updateStats();
    
    // Show toast
    const sound = this.selectedCreature.sounds.happy[
      Math.floor(Math.random() * this.selectedCreature.sounds.happy.length)
    ];
    this.showToast(sound, '🎮');
    
    // Spawn floating emojis
    this.spawnFloatingEmojis(['⭐', '🌟', '✨', '🎉']);
    
    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 80]);
    }
  }

  showToast(message, icon = '') {
    const toast = this.elements.toast;
    const iconEl = toast.querySelector('.toast-icon');
    const textEl = toast.querySelector('.toast-text');
    
    iconEl.textContent = icon;
    textEl.textContent = message;
    
    toast.classList.add('visible');
    
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2000);
  }

  spawnFloatingEmojis(emojis) {
    const container = this.elements.arContainer;
    
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.className = 'floating-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.cssText = `
          position: fixed;
          left: ${30 + Math.random() * 40}%;
          bottom: 25%;
          font-size: ${24 + Math.random() * 16}px;
          pointer-events: none;
          z-index: 200;
          animation: floatUp 1.5s ease-out forwards;
        `;
        
        container.appendChild(emoji);
        
        setTimeout(() => emoji.remove(), 1500);
      }, i * 100);
    }
  }

  openMenu() {
    // Simple menu - could be expanded
    if (confirm('Return to creature selection?')) {
      location.reload();
    }
  }
}

// Add floating emoji animation
const style = document.createElement('style');
style.textContent = `
  @keyframes floatUp {
    0% {
      transform: translateY(0) scale(0.5) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(-150px) scale(1.2) rotate(${Math.random() > 0.5 ? '' : '-'}20deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize app
const app = new App();