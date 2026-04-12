export class LocationManager {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.listeners = [];
  }

  isSupported() {
    return 'geolocation' in navigator;
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation tidak didukung browser ini'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          resolve(this.currentPosition);
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }

  watchPosition(callback) {
    if (!this.isSupported()) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
        callback(this.currentPosition);
        this.listeners.forEach(fn => fn(this.currentPosition));
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  onUpdate(fn) {
    this.listeners.push(fn);
  }

  getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3;
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  isInRange(ghostLocation, radius = 50) {
    if (!this.currentPosition) return false;
    const dist = this.getDistance(
      this.currentPosition.lat, this.currentPosition.lng,
      ghostLocation.lat, ghostLocation.lng
    );
    return dist <= radius;
  }

  getDistanceTo(ghostLocation) {
    if (!this.currentPosition) return null;
    return this.getDistance(
      this.currentPosition.lat, this.currentPosition.lng,
      ghostLocation.lat, ghostLocation.lng
    );
  }

  formatDistance(meters) {
    if (meters === null) return '?';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  }
}
