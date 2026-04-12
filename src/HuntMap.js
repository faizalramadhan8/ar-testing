import { ghosts } from './ghosts.js';

export class HuntMap {
  constructor(container, collection, locationManager, callbacks = {}) {
    this.container = container;
    this.collection = collection;
    this.locationManager = locationManager;
    this.callbacks = callbacks;
    this.cards = new Map();
    this.huntRadius = 50;
  }

  render() {
    this.container.innerHTML = '';
    this.cards.clear();

    ghosts.forEach(ghost => {
      const card = this.createGhostCard(ghost);
      this.container.appendChild(card);
      this.cards.set(ghost.id, card);
    });
  }

  createGhostCard(ghost) {
    const card = document.createElement('div');
    card.className = 'ghost-card';
    card.dataset.id = ghost.id;

    const isCaptured = this.collection.has(ghost.id);
    const distance = this.getDistanceToGhost(ghost);
    const inRange = distance !== null && distance <= this.huntRadius;

    if (isCaptured) card.classList.add('captured');
    else if (inRange) card.classList.add('in-range');
    else if (distance === null) card.classList.add('locked');

    card.innerHTML = `
      <div class="ghost-card-avatar" style="background: ${ghost.gradient}">
        ${isCaptured ? ghost.icon : (inRange ? ghost.icon : this.silhouetteIcon())}
      </div>
      <div class="ghost-card-info">
        <div class="ghost-card-name">${isCaptured || inRange ? ghost.name : '???'}</div>
        <div class="ghost-card-desc">${isCaptured ? ghost.description : (inRange ? ghost.lore.slice(0, 50) + '...' : 'Hantu belum terdeteksi')}</div>
        <div class="ghost-card-meta">
          <span class="ghost-rarity ${ghost.rarity}">${ghost.rarity}</span>
          <span class="ghost-distance ${inRange ? 'near' : ''}">${this.formatDistanceLabel(distance)}</span>
        </div>
      </div>
      <div class="ghost-card-action">
        ${this.renderAction(ghost, isCaptured, inRange)}
      </div>
    `;

    const btn = card.querySelector('.ghost-hunt-btn');
    if (btn && !btn.disabled) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.callbacks.onHunt) this.callbacks.onHunt(ghost);
      });
    }

    return card;
  }

  renderAction(ghost, isCaptured, inRange) {
    if (isCaptured) {
      return `<span class="ghost-captured-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#9B59B6"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        Ditangkap
      </span>`;
    }
    if (inRange) {
      return `<button class="ghost-hunt-btn">Buru!</button>`;
    }
    return `<button class="ghost-hunt-btn" disabled>Jauh</button>`;
  }

  silhouetteIcon() {
    return `<svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="36" rx="14" ry="18" fill="rgba(255,255,255,0.15)"/>
      <circle cx="26" cy="32" r="2" fill="rgba(255,255,255,0.2)"/>
      <circle cx="38" cy="32" r="2" fill="rgba(255,255,255,0.2)"/>
      <text x="32" y="52" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="10">?</text>
    </svg>`;
  }

  getDistanceToGhost(ghost) {
    if (!ghost.spawnPoints || ghost.spawnPoints.length === 0) return null;
    const nearest = ghost.spawnPoints[0];
    return this.locationManager.getDistanceTo(nearest);
  }

  formatDistanceLabel(distance) {
    if (distance === null) return 'GPS diperlukan';
    return this.locationManager.formatDistance(distance);
  }

  update() {
    ghosts.forEach(ghost => {
      const existing = this.cards.get(ghost.id);
      if (existing) {
        const newCard = this.createGhostCard(ghost);
        existing.replaceWith(newCard);
        this.cards.set(ghost.id, newCard);
      }
    });
  }

  enableDevMode() {
    ghosts.forEach(ghost => {
      const card = this.cards.get(ghost.id);
      if (!card) return;
      if (this.collection.has(ghost.id)) return;

      card.classList.remove('locked');
      card.classList.add('in-range');

      const newCard = this.createDevCard(ghost);
      card.replaceWith(newCard);
      this.cards.set(ghost.id, newCard);
    });
  }

  createDevCard(ghost) {
    const card = document.createElement('div');
    card.className = 'ghost-card in-range';
    card.dataset.id = ghost.id;

    card.innerHTML = `
      <div class="ghost-card-avatar" style="background: ${ghost.gradient}">
        ${ghost.icon}
      </div>
      <div class="ghost-card-info">
        <div class="ghost-card-name">${ghost.name}</div>
        <div class="ghost-card-desc">${ghost.description}</div>
        <div class="ghost-card-meta">
          <span class="ghost-rarity ${ghost.rarity}">${ghost.rarity}</span>
          <span class="ghost-distance near">DEV MODE</span>
        </div>
      </div>
      <div class="ghost-card-action">
        <button class="ghost-hunt-btn">Buru!</button>
      </div>
    `;

    const btn = card.querySelector('.ghost-hunt-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.callbacks.onHunt) this.callbacks.onHunt(ghost);
    });

    return card;
  }
}
