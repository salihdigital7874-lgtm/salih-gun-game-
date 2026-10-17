// High-fidelity procedural sound engine using Web Audio API

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundVolume: number = 0.7;
  private musicVolume: number = 0.4;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(soundVol: number, musicVol: number) {
    this.soundVolume = Math.max(0, Math.min(1, soundVol));
    this.musicVolume = Math.max(0, Math.min(1, musicVol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.musicVolume * 0.15, this.ctx.currentTime);
    }
  }

  public playShoot(weaponType: string) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.soundVolume, t);
    masterGain.connect(this.ctx.destination);

    switch (weaponType) {
      case 'pistol': {
        // Sharp pop with high snap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        // Noise click
        this.addNoiseBurst(t, 0.04, 1800, 0.8, masterGain);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.13);
        break;
      }
      case 'revolver': {
        // Heavy boom with metal body resonance
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.28);
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        this.addNoiseBurst(t, 0.12, 900, 1.0, masterGain);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'smg': {
        // Crisp rapid fire snap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        this.addNoiseBurst(t, 0.05, 2400, 0.6, masterGain);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }
      case 'shotgun': {
        // Massive concussion burst
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        this.addNoiseBurst(t, 0.22, 600, 1.2, masterGain);
        this.addNoiseBurst(t, 0.08, 3000, 0.7, masterGain);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.36);
        break;
      }
      case 'rifle': {
        // Balanced assault rifle punch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.15);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        this.addNoiseBurst(t, 0.09, 1400, 0.8, masterGain);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }
      case 'sniper': {
        // Supersonic whip crack + booming echo
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(780, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.45);
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        this.addNoiseBurst(t, 0.25, 1200, 1.3, masterGain);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.46);
        break;
      }
      case 'plasma': {
        // Sci-fi energizing beam whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.22);
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        const sub = this.ctx.createOscillator();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(120, t);
        sub.frequency.exponentialRampToValueAtTime(40, t + 0.25);
        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.6, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);
        sub.connect(subGain);
        subGain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.23);
        sub.start(t);
        sub.stop(t + 0.26);
        break;
      }
      case 'knife': {
        // Quick slash whoosh
        this.addNoiseBurst(t, 0.08, 2200, 0.5, masterGain);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(250, t + 0.1);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.11);
        break;
      }
    }
  }

  private addNoiseBurst(time: number, duration: number, filterFreq: number, volume: number, dest: AudioNode) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start(time);
    whiteNoise.stop(time + duration);
  }

  public playHitmark(isHeadshot: boolean = false) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = isHeadshot ? 1760 : 1050;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.06);

    gain.gain.setValueAtTime(this.soundVolume * (isHeadshot ? 0.9 : 0.6), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playTierUp() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      const noteTime = t + idx * 0.08;
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(this.soundVolume * 0.7, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.23);
    });
  }

  public playExplosion() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.6);

    gain.gain.setValueAtTime(this.soundVolume * 1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    this.addNoiseBurst(t, 0.5, 450, 1.2, this.ctx.destination);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  public playReload() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Click 1 (mag drop)
    this.addNoiseBurst(t, 0.05, 3000, 0.4, this.ctx.destination);
    // Click 2 (mag insert)
    this.addNoiseBurst(t + 0.28, 0.06, 2500, 0.5, this.ctx.destination);
    // Slide rack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t + 0.5);
    osc.frequency.linearRampToValueAtTime(400, t + 0.6);
    gain.gain.setValueAtTime(this.soundVolume * 0.35, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.62);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t + 0.5);
    osc.stop(t + 0.62);
  }

  public playJump() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);
    gain.gain.setValueAtTime(this.soundVolume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playFootstep() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.addNoiseBurst(t, 0.04, 800, 0.15, this.ctx.destination);
  }

  public playVictory() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const t = this.ctx.currentTime;
    notes.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t + i * 0.15);
      gain.gain.setValueAtTime(this.soundVolume * 0.5, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.52);
    });
  }

  public playDefeat() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const notes = [330, 311, 293, 261];
    const t = this.ctx.currentTime;
    notes.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t + i * 0.2);
      gain.gain.setValueAtTime(this.soundVolume * 0.5, t + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.42);
    });
  }

  public startAmbientLoop() {
    this.initContext();
    if (!this.ctx || this.ambientOsc) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      gain.gain.setValueAtTime(this.musicVolume * 0.15, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.ambientOsc = osc;
      this.ambientGain = gain;
    } catch {
      // Audio autoplay policy
    }
  }

  public stopAmbientLoop() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {
        // Ignored
      }
      this.ambientOsc = null;
      this.ambientGain = null;
    }
  }
}

export const soundManager = new SoundManager();
