/**
 * Comprehensive Audio & Voice Engine for "Bé Ghép Khuôn Mặt"
 * 
 * 1. Web Audio API synthesizer for instant sound effects:
 *    - "Tích!" (crystal marimba chime)
 *    - "Boing!" (elastic bouncy spring recoil)
 *    - Victory fanfare celebration melody (2-3 seconds)
 *    - Gentle touch pop
 * 
 * 2. Dedicated Vietnamese Voice Queue System:
 *    - Audio files: pre-bundled authentic Vietnamese female voice MP3s in /assets/audio/
 *    - Teacher custom recordings: recorded via microphone or uploaded (MP3/WAV/M4A),
 *      saved persistently in browser IndexedDB.
 *    - Priority: Teacher custom recording -> Bundled Vietnamese MP3 -> Web Speech API fallback
 *    - Audio queue ensures tick chime & voice do NOT collide and sequential drops play in order.
 */

export interface AudioItemConfig {
  key: string;
  label: string;
  speechText: string;
  category: 'part' | 'special';
  defaultAudioUrl: string;
}

export const AUDIO_CONFIGS: AudioItemConfig[] = [
  {
    key: 'eye_left',
    label: 'Mắt trái',
    speechText: 'Mắt trái',
    category: 'part',
    defaultAudioUrl: '/assets/audio/eye_left.mp3',
  },
  {
    key: 'eye_right',
    label: 'Mắt phải',
    speechText: 'Mắt phải',
    category: 'part',
    defaultAudioUrl: '/assets/audio/eye_right.mp3',
  },
  {
    key: 'ear_left',
    label: 'Tai trái',
    speechText: 'Tai trái',
    category: 'part',
    defaultAudioUrl: '/assets/audio/ear_left.mp3',
  },
  {
    key: 'ear_right',
    label: 'Tai phải',
    speechText: 'Tai phải',
    category: 'part',
    defaultAudioUrl: '/assets/audio/ear_right.mp3',
  },
  {
    key: 'nose',
    label: 'Mũi',
    speechText: 'Mũi',
    category: 'part',
    defaultAudioUrl: '/assets/audio/nose.mp3',
  },
  {
    key: 'mouth',
    label: 'Miệng',
    speechText: 'Miệng',
    category: 'part',
    defaultAudioUrl: '/assets/audio/mouth.mp3',
  },
  {
    key: 'eyes',
    label: 'Cặp Mắt (Mức dễ)',
    speechText: 'Mắt',
    category: 'part',
    defaultAudioUrl: '/assets/audio/eyes.mp3',
  },
  {
    key: 'ears',
    label: 'Cặp Tai (Mức dễ)',
    speechText: 'Tai',
    category: 'part',
    defaultAudioUrl: '/assets/audio/ears.mp3',
  },
  {
    key: 'intro',
    label: 'Lời giới thiệu mở đầu',
    speechText: 'Các bé ơi! Chúng mình cùng ghép khuôn mặt nhé!',
    category: 'special',
    defaultAudioUrl: '/assets/audio/intro.mp3',
  },
  {
    key: 'congrats',
    label: 'Lời khen chúc mừng',
    speechText: 'Hoan hô! Con giỏi lắm!',
    category: 'special',
    defaultAudioUrl: '/assets/audio/congrats.mp3',
  },
];

const DB_NAME = 'BabyFaceAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'teacherRecordings';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isSfxEnabled: boolean = true;
  private customAudioCache: Map<string, string> = new Map(); // key -> objectURL
  private customAudioBlobs: Map<string, Blob> = new Map();
  private isInitialized: boolean = false;

  // Queue state for non-overlapping voice playback
  private voiceQueue: Array<{
    url: string;
    text: string;
    onEnd?: () => void;
  }> = [];
  private isVoicePlaying: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private changeListeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIndexedDB().catch((err) => {
        console.warn('Failed to initialize Audio IndexedDB:', err);
      });
    }
  }

  public subscribe(cb: () => void): () => void {
    this.changeListeners.push(cb);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== cb);
    };
  }

  private notifyChange() {
    this.changeListeners.forEach((cb) => cb());
  }

  /**
   * Initialize IndexedDB to persistently store teacher custom audio recordings
   */
  private async initIndexedDB(): Promise<void> {
    if (this.isInitialized) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = async (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        try {
          await this.loadAllTeacherRecordings(db);
          this.isInitialized = true;
          this.notifyChange();
          resolve();
        } catch (err) {
          resolve();
        }
      };

      request.onerror = () => {
        resolve(); // gracefully proceed even if indexedDB is restricted
      };
    });
  }

  private loadAllTeacherRecordings(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result as Array<{ key: string; blob: Blob }>;
        records.forEach(({ key, blob }) => {
          this.customAudioBlobs.set(key, blob);
          const objUrl = URL.createObjectURL(blob);
          this.customAudioCache.set(key, objUrl);
        });
        resolve();
      };

      req.onerror = () => resolve();
    });
  }

  public hasCustomRecording(key: string): boolean {
    return this.customAudioCache.has(key);
  }

  public async saveTeacherRecording(key: string, blob: Blob): Promise<void> {
    this.customAudioBlobs.set(key, blob);
    // Revoke previous URL if exists
    if (this.customAudioCache.has(key)) {
      URL.revokeObjectURL(this.customAudioCache.get(key)!);
    }
    const newUrl = URL.createObjectURL(blob);
    this.customAudioCache.set(key, newUrl);
    this.notifyChange();

    // Persist to IndexedDB
    try {
      const db = await this.getDB();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ key, blob });
      }
    } catch (err) {
      console.warn('Error saving teacher audio to DB:', err);
    }
  }

  public async deleteTeacherRecording(key: string): Promise<void> {
    if (this.customAudioCache.has(key)) {
      URL.revokeObjectURL(this.customAudioCache.get(key)!);
      this.customAudioCache.delete(key);
    }
    this.customAudioBlobs.delete(key);
    this.notifyChange();

    try {
      const db = await this.getDB();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(key);
      }
    } catch (err) {
      console.warn('Error deleting teacher audio from DB:', err);
    }
  }

  private getDB(): Promise<IDBDatabase | null> {
    return new Promise((resolve) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSfxEnabled(enabled: boolean) {
    this.isSfxEnabled = enabled;
    if (!enabled) {
      this.stopAllVoices();
    }
  }

  public getSfxEnabled(): boolean {
    return this.isSfxEnabled;
  }

  /**
   * Synthesized Sound: "TÍCH!" (✓)
   * High, crystal-clear marimba bell chime when a piece is snapped correctly.
   */
  public playTick() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1567.98, now);
    osc2.frequency.exponentialRampToValueAtTime(2093.0, now + 0.08);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.28);
  }

  /**
   * Synthesized Sound: "BOING!"
   * Cheerful, gentle cartoon spring bounce when dropped incorrectly.
   */
  public playBoing() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.55;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
    osc.frequency.linearRampToValueAtTime(320, now + 0.22);
    osc.frequency.linearRampToValueAtTime(370, now + 0.32);
    osc.frequency.linearRampToValueAtTime(280, now + 0.44);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, now);
    subOsc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.2);
  }

  /**
   * Sound: Victory celebration fanfare melody (2-3 seconds)
   */
  public playVictoryMusic() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.22 },
      { freq: 659.25, time: 0.16, dur: 0.22 },
      { freq: 783.99, time: 0.32, dur: 0.24 },
      { freq: 1046.5, time: 0.48, dur: 0.45 },
      { freq: 880.0, time: 0.8, dur: 0.22 },
      { freq: 1046.5, time: 0.98, dur: 0.22 },
      { freq: 1318.51, time: 1.2, dur: 0.8 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      noteOsc.type = 'triangle';
      noteOsc.frequency.setValueAtTime(freq, now + time);

      noteGain.gain.setValueAtTime(0.001, now + time);
      noteGain.gain.linearRampToValueAtTime(0.28, now + time + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start(now + time);
      noteOsc.stop(now + time + dur);

      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(freq * 2, now + time);

      shimmerGain.gain.setValueAtTime(0.001, now + time);
      shimmerGain.gain.linearRampToValueAtTime(0.12, now + time + 0.03);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur * 0.7);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmerOsc.start(now + time);
      shimmerOsc.stop(now + time + dur * 0.7);
    });
  }

  /**
   * Sound: Gentle click / touch bubble pop
   */
  public playTouchPop() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Resolve audio URL for a given sound key (prioritizing teacher custom recording)
   */
  public getAudioUrlForKey(key: string): { url: string; isCustom: boolean } {
    if (this.customAudioCache.has(key)) {
      return { url: this.customAudioCache.get(key)!, isCustom: true };
    }
    const config = AUDIO_CONFIGS.find((c) => c.key === key);
    return {
      url: config ? config.defaultAudioUrl : `/assets/audio/${key}.mp3`,
      isCustom: false,
    };
  }

  /**
   * Queue a voice to play without collision
   */
  public queueVoice(key: string, onEnd?: () => void) {
    if (!this.isSfxEnabled) {
      if (onEnd) onEnd();
      return;
    }

    const { url } = this.getAudioUrlForKey(key);
    const config = AUDIO_CONFIGS.find((c) => c.key === key);
    const text = config?.speechText || key;

    this.voiceQueue.push({ url, text, onEnd });
    this.processQueue();
  }

  /**
   * Play an isolated audio sample directly (for teacher testing in settings)
   */
  public async playSample(key: string): Promise<void> {
    const { url } = this.getAudioUrlForKey(key);
    const config = AUDIO_CONFIGS.find((c) => c.key === key);
    const text = config?.speechText || key;

    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.volume = 1.0;
      audio.onended = () => resolve();
      audio.onerror = () => {
        // Fallback to Web Speech API
        this.speakFallback(text).then(resolve);
      };
      audio.play().catch(() => {
        this.speakFallback(text).then(resolve);
      });
    });
  }

  /**
   * Play "Tích!" chime first, followed cleanly by the part's voice after 220ms
   */
  public playPartSuccess(key: string, onEnd?: () => void) {
    this.playTick();
    setTimeout(() => {
      this.queueVoice(key, onEnd);
    }, 220);
  }

  /**
   * Play introduction voice when starting game
   */
  public playIntro(onEnd?: () => void) {
    this.queueVoice('intro', onEnd);
  }

  /**
   * Play celebration congrats voice when all parts are placed
   */
  public playCongrats(onEnd?: () => void) {
    // Play fanfare first
    this.playVictoryMusic();
    // After fanfare peaks (800ms), play congratulations voice
    setTimeout(() => {
      this.queueVoice('congrats', onEnd);
    }, 800);
  }

  private processQueue() {
    if (this.isVoicePlaying || this.voiceQueue.length === 0 || !this.isSfxEnabled) {
      return;
    }

    const item = this.voiceQueue.shift()!;
    this.isVoicePlaying = true;

    const handleEnd = () => {
      this.isVoicePlaying = false;
      this.currentAudioElement = null;
      if (item.onEnd) item.onEnd();
      // Small 100ms breathing room between sequential voices
      setTimeout(() => this.processQueue(), 100);
    };

    try {
      const audio = new Audio(item.url);
      this.currentAudioElement = audio;
      audio.volume = 1.0;

      audio.onended = () => handleEnd();
      audio.onerror = () => {
        // Fallback to browser Web Speech API
        this.speakFallback(item.text).then(() => handleEnd());
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.speakFallback(item.text).then(() => handleEnd());
        });
      }
    } catch (e) {
      this.speakFallback(item.text).then(() => handleEnd());
    }
  }

  private speakFallback(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.88; // Gentle nursery speed
        utterance.pitch = 1.05; // Friendly female pitch
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        resolve();
      }
    });
  }

  public stopAllVoices() {
    this.voiceQueue = [];
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    this.isVoicePlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
