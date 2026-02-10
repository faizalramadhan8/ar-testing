import { CREATURES, getCreatureById } from './creatures.js';
import { ARScene } from './ARScene.js';

/**
 * Main Application Controller
 * Handles UI, creature selection, and AR scene management
 */
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

  init() {
    // Cache DOM elements
    this.elements = {
      loadingScreen: document.getElementById('loading-screen'),
      startScreen: document.getElementById('start-screen'),
      creatureGrid: document.getElementById('creature-grid'),
      startBtn: document.getElementById('start-btn'),
      arContainer: document.getElementById('ar-container'),
      arHud: document.getElementById('ar-hud'),
      instructionOverlay: document.getElementById('instruction-overlay'),
      hudAvatar: document.getElementById('hud-avatar'),
      hudName: document.getElementById('hud-name'),
      healthBar: document.getElementById('health-bar'),
      happinessBar: document.getElementById('happiness-bar'),
      toast: document.getElementById('toast'),
      fallbackBanner: document.getElementById('fallback-banner'),
      errorScreen: document.getElementById('error-screen'),
      btnFeed: document.getElementById('btn-feed'),
      btnPet: document.getElementById('btn-pet'),
      btnPlay: document.getElementById('btn-play')
    };

    // Initialize UI
    this.populateCreatureGrid();
    this.setupEventListeners();

    // Simulate loading
    setTimeout(() => {
      this.hideLoading();
    }, 2000);
  }

  populateCreatureGrid() {
    const grid = this.elements.creatureGrid;
    grid.innerHTML = '';

    CREATURES.forEach((creature, index) => {
      const card = document.createElement('div');
      card.className = 'creature-card';
      card.dataset.id = creature.id;
      card.innerHTML = `
        <span class="creature-preview">${creature.emoji}</span>
        <span class="creature-name">${creature.name}</span>
      `;
      
      // Staggered entrance animation
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + index * 50);

      card.addEventListener('click', () => this.selectCreature(creature.id));
      grid.appendChild(card);
    });
  }

  selectCreature(id) {
    // Update selection
    this.selectedCreature = getCreatureById(id);

    // Update UI
    document.querySelectorAll('.creature-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.id === id);
    });

    // Enable start button
    this.elements.startBtn.disabled = false;
    this.elements.startBtn.innerHTML = `🎮 Start with ${this.selectedCreature.name}!`;

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  setupEventListeners() {
    // Start button
    this.elements.startBtn.addEventListener('click', () => this.startARExperience());

    // AR interaction buttons
    this.elements.btnFeed.addEventListener('click', () => this.feedCreature());
    this.elements.btnPet.addEventListener('click', () => this.petCreature());
    this.elements.btnPlay.addEventListener('click', () => this.playWithCreature());

    // Tap to place in AR
    this.elements.arContainer.addEventListener('click', (e) => {
      if (this.arScene && !this.arScene.isCreaturePlaced) {
        this.arScene.handleTap(e.clientX, e.clientY);
      }
    });

    // Touch events for mobile
    this.elements.arContainer.addEventListener('touchend', (e) => {
      if (this.arScene && !this.arScene.isCreaturePlaced && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        this.arScene.handleTap(touch.clientX, touch.clientY);
      }
    });
  }

  hideLoading() {
    this.elements.loadingScreen.classList.add('hidden');
    this.elements.startScreen.classList.add('visible');
  }

  async startARExperience() {
    if (!this.selectedCreature) return;

    // Request camera permission first (required for iOS)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      console.log('Camera permission granted');
    } catch (err) {
      console.log('Camera permission denied or not available:', err);
      // Continue anyway, fallback mode will handle it
    }

    // Hide start screen
    this.elements.startScreen.classList.remove('visible');

    // Initialize AR Scene
    this.arScene = new ARScene(this.elements.arContainer, this.selectedCreature);

    // Set callbacks
    this.arScene.onCreaturePlaced = () => {
      this.elements.instructionOverlay.style.display = 'none';
      this.showToast(`${this.selectedCreature.name} appeared!`);
    };

    this.arScene.onARStarted = (isFallback) => {
      this.elements.arHud.classList.add('visible');
      this.updateHUD();
      
      if (isFallback) {
        this.elements.fallbackBanner.classList.add('visible');
        this.elements.instructionOverlay.style.display = 'none';
      }
    };

    this.arScene.onARError = (error) => {
      console.error('AR Error:', error);
      this.elements.errorScreen.classList.add('visible');
    };

    // Start AR
    await this.arScene.startAR();
  }

  updateHUD() {
    this.elements.hudAvatar.textContent = this.selectedCreature.emoji;
    this.elements.hudName.textContent = this.selectedCreature.name;
    this.elements.healthBar.style.width = `${this.creatureStats.health}%`;
    this.elements.happinessBar.style.width = `${this.creatureStats.happiness}%`;
  }

  feedCreature() {
    if (!this.arScene || !this.arScene.isCreaturePlaced) return;

    const sound = this.arScene.feedCreature();
    this.showToast(sound);
    
    // Update stats
    this.creatureStats.health = Math.min(100, this.creatureStats.health + 10);
    this.creatureStats.happiness = Math.min(100, this.creatureStats.happiness + 5);
    this.updateHUD();
    
    // Create floating effect
    this.createFloatingEmoji('🍎');
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }

  petCreature() {
    if (!this.arScene || !this.arScene.isCreaturePlaced) return;

    const sound = this.arScene.petCreature();
    this.showToast(sound);
    
    // Update stats
    this.creatureStats.happiness = Math.min(100, this.creatureStats.happiness + 15);
    this.updateHUD();
    
    // Create floating hearts
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.createFloatingEmoji('❤️'), i * 100);
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30, 20, 50]);
    }
  }

  playWithCreature() {
    if (!this.arScene || !this.arScene.isCreaturePlaced) return;

    const sound = this.arScene.playWithCreature();
    this.showToast(sound);
    
    // Update stats
    this.creatureStats.happiness = Math.min(100, this.creatureStats.happiness + 20);
    this.creatureStats.health = Math.max(0, this.creatureStats.health - 5); // Playing uses energy
    this.updateHUD();
    
    // Create floating effect
    this.createFloatingEmoji('⭐');
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 30, 100]);
    }
  }

  createFloatingEmoji(emoji) {
    const effect = document.createElement('div');
    effect.className = 'interaction-effect heart-burst';
    effect.textContent = emoji;
    effect.style.cssText = `
      position: fixed;
      left: ${50 + (Math.random() - 0.5) * 20}%;
      top: 50%;
      font-size: 48px;
      z-index: 200;
      pointer-events: none;
    `;
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
      effect.remove();
    }, 1000);
  }

  showToast(message) {
    const toast = this.elements.toast;
    toast.textContent = message;
    toast.classList.add('visible');
    
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});