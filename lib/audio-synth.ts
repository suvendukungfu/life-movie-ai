class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private projectorOsc: OscillatorNode | null = null;
  private projectorGain: GainNode | null = null;
  private projectorInterval: ReturnType<typeof setInterval> | null = null;
  private isProjectorPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (e) {
        console.warn("Web Audio API not supported in this browser:", e);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopProjector();
    } else {
      this.playChime();
    }
    return !this.isMuted;
  }

  public getSoundState(): boolean {
    return !this.isMuted;
  }

  // Vintage shutter snap
  public playShutter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Click 1: mirror pop
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(140, t);
    osc1.frequency.exponentialRampToValueAtTime(30, t + 0.04);
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.05);

    // Click 2: shutter curtain
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1200, t + 0.04);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, t + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(t + 0.04);
    whiteNoise.stop(t + 0.1);
  }

  // Soft tactile paper rustle / tactile tap
  public playTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.05);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Warm chime when turning sound on
  public playChime() {
    this.initContext();
    if (!this.ctx) return;

    const notes = [329.63, 440, 554.37, 659.25]; // E4, A4, C#5, E5
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.09, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.9);
    });
  }

  // Ambient film projector loop
  public startProjector() {
    if (this.isMuted || this.isProjectorPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isProjectorPlaying = true;
    this.projectorInterval = setInterval(() => {
      if (this.isMuted || !this.isProjectorPlaying) return;
      this.playSingleSprocketClick();
    }, 90);
  }

  public startProjectorGate() {
    this.startProjector();
  }

  private playSingleSprocketClick() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.03);
    gain.gain.setValueAtTime(0.04 + Math.random() * 0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  public stopProjector() {
    this.isProjectorPlaying = false;
    if (this.projectorInterval) {
      clearInterval(this.projectorInterval);
      this.projectorInterval = null;
    }
  }

  public stopProjectorGate() {
    this.stopProjector();
  }

  // Cinematic trailer swelling note
  public playCinematicChord() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [130.81, 196.0, 246.94, 329.63, 392.0]; // C3, G3, B3, E4, G4 (Cmaj9)
    const t = this.ctx.currentTime;
    chords.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 2.5);
      filter.frequency.exponentialRampToValueAtTime(400, t + 5.0);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 5.6);
    });
  }
}

export const sound = new SoundEngine();
