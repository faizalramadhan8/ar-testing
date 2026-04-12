const STORAGE_KEY = 'ghosthunter_collection';

export class Collection {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  add(ghostId) {
    if (this.has(ghostId)) return false;
    this.data.push({
      ghostId,
      capturedAt: new Date().toISOString()
    });
    this._save();
    return true;
  }

  has(ghostId) {
    return this.data.some(entry => entry.ghostId === ghostId);
  }

  get(ghostId) {
    return this.data.find(entry => entry.ghostId === ghostId) || null;
  }

  getAll() {
    return [...this.data];
  }

  getStats() {
    return {
      total: this.data.length,
      entries: this.data
    };
  }

  clear() {
    this.data = [];
    this._save();
  }
}
