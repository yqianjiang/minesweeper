export class Timer {
  constructor(callback) {
    this.callback = callback;
    this.startTime = null;
    this.paused = false;
  }

  update(timestamp) {
    if (this.paused) {
      requestAnimationFrame(this.update.bind(this));
      return;
    }

    if (!this.startTime) {
      this.startTime = timestamp;
    }

    const elapsedTime = timestamp - this.startTime;
    if (elapsedTime >= 1000) {
      this.callback();
      this.startTime = timestamp;
    }

    requestAnimationFrame(this.update.bind(this));
  }

  start() {
    if (!this.paused) {
      this.clear();
    }
    this.paused = false;
    requestAnimationFrame(this.update.bind(this));
  }

  clear() {
    this.startTime = null;
    this.pause();
  }

  pause() {
    this.paused = true;
  }
}