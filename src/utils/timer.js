export class Timer {
  constructor(callback) {
    this.callback = callback;
    this.startTime = null;
    this.paused = false;
  }

  update() {
    if (this.paused) {
      requestAnimationFrame(this.update.bind(this));
      return;
    }

    const timestamp = performance.now();
    if (!this.startTime) {
      this.startTime = timestamp;
    }

    const elapsedTime = timestamp - this.startTime;
    if (elapsedTime >= 1) {
      this.callback(elapsedTime);
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
