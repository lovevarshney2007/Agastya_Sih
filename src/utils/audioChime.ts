/**
 * Synthesizes harmonic auditory cues for verification using the browser's Web Audio API.
 * Zero external audio files required, zero latency, runs offline.
 */

class AudioChimeService {
  private ctx: AudioContext | null = null;
  private muted: boolean;

  constructor() {
    this.muted = typeof window !== 'undefined' ? localStorage.getItem('agastya_audio_muted') === 'true' : false;
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Harmonious ascending chord (C5 -> E5 -> G5) simulating UPI/Google Pay/DigiLocker success chime
   */
  playSuccess(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.15 }, // C5
        { freq: 659.25, time: 0.08, dur: 0.18 }, // E5
        { freq: 783.99, time: 0.16, dur: 0.40 }, // G5
        { freq: 1046.50, time: 0.22, dur: 0.45 } // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Pleasant bell-like decay envelope
        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.18, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {
      // Audio playback silently disregarded if user policy denies
    }
  }

  /**
   * Minor tone buzzer for invalid / revoked / error records
   */
  playWarning(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Silent error ignore
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('agastya_audio_muted', String(this.muted));
    } catch {}
    return this.muted;
  }
}

export const audioChime = new AudioChimeService();
