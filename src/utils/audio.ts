import { EMBEDDED_AUDIO_BASE64 } from './audioData';

/**
 * Comprehensive Audio & Voice Engine for "Bé Ghép Khuôn Mặt"
 * 
 * Multi-layer Bulletproof Architecture:
 * 1. Web Audio API with pre-decoded AudioBuffers from embedded Base64 MP3:
 *    - Zero network requests (eliminates 404s, CORS, CDN, & Vercel routing issues)
 *    - Immune to Autoplay timeout restrictions (AudioBufferSourceNode can play anytime once AudioContext is unlocked)
 *    - Instant 0ms latency for toddlers
 * 
 * 2. Automatic Audio Unlocker:
 *    - Listens for first touch/click/key to unlock AudioContext across iOS Safari, Android, and Smart TVs
 * 
 * 3. Teacher Custom Recordings:
 *    - Microphone & MP3/WAV/M4A upload persistently saved in IndexedDB
 *    - Prioritized over default voice
 * 
 * 4. Non-blocking Sequential Audio Queue with Watchdog Timer:
 *    - Ensures "Tích!" chime and voice never overlap
 *    - Guarantees sequential playback when pieces are placed rapidly
 *    - 3.5s watchdog timer prevents queue deadlocks on any browser
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

// Convert base64 data URI to ArrayBuffer for Web Audio API decoding
function base64ToArrayBuffer(base64DataUri: string): ArrayBuffer {
  const base64 = base64DataUri.includes(',') ? base64DataUri.split(',')[1] : base64DataUri;
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isSfxEnabled: boolean = true;
  private customAudioCache: Map<string, string> = new Map(); // key -> objectURL
  private customAudioBlobs: Map<string, Blob> = new Map();
  private decodedBuffers: Map<string, AudioBuffer> = new Map(); // key -> AudioBuffer
  private isDecodingAudio: boolean = false;
  private isUnlocked: boolean = false;
  private isInitialized: boolean = false;

  // Queue state for non-overlapping voice playback
  private voiceQueue: Array<{
    key: string;
    text: string;
    onEnd?: () => void;
  }> = [];
  private isVoicePlaying: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentBufferSource: AudioBufferSourceNode | null = null;
  private changeListeners: Array<() => void> = [];
  private queueWatchdogTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIndexedDB().catch((err) => {
        console.warn('Failed to initialize Audio IndexedDB:', err);
      });
      this.setupGlobalUnlockListener();
    }
  }

  /**
   * One-touch global audio unlocker for mobile Safari, Chrome, and Smart TVs
   */
  private setupGlobalUnlockListener() {
    const unlockHandler = () => {
      this.unlockAudio();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('click', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
  }

  /**
   * Explicitly unlock and resume AudioContext
   */
  public async unlockAudio(): Promise<void> {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') {
      return;
    }
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Play a short silent buffer to unlock iOS AudioContext
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      this.isUnlocked = true;

      // Start pre-decoding bundled audio in background
      this.preloadAndDecodeAll();
    } catch (e) {
      console.warn('Audio unlock warning:', e);
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
    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve();
        return;
      }
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
        } catch {
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
    if (this.customAudioCache.has(key)) {
      URL.revokeObjectURL(this.customAudioCache.get(key)!);
    }
    const newUrl = URL.createObjectURL(blob);
    this.customAudioCache.set(key, newUrl);
    // Invalidate cached decoded buffer so new recording is used
    this.decodedBuffers.delete(key);
    this.notifyChange();

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
    this.decodedBuffers.delete(key);
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
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
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

  /**
   * Pre-decode all embedded audio files into memory AudioBuffers
   */
  private async preloadAndDecodeAll(): Promise<void> {
    if (this.isDecodingAudio) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.isDecodingAudio = true;

    for (const [key, b64] of Object.entries(EMBEDDED_AUDIO_BASE64)) {
      if (!this.decodedBuffers.has(key)) {
        try {
          const arrayBuffer = base64ToArrayBuffer(b64);
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          this.decodedBuffers.set(key, audioBuffer);
        } catch {
          // If decoding one fails, continue with others
        }
      }
    }
    this.isDecodingAudio = false;
  }

  /**
   * Decode an individual key on-demand if not already decoded
   */
  private async getDecodedBuffer(key: string): Promise<AudioBuffer | null> {
    if (this.decodedBuffers.has(key)) {
      return this.decodedBuffers.get(key)!;
    }
    const ctx = this.getAudioContext();
    if (!ctx) return null;

    // Check if teacher custom recording blob exists
    if (this.customAudioBlobs.has(key)) {
      try {
        const blob = this.customAudioBlobs.get(key)!;
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.decodedBuffers.set(key, audioBuffer);
        return audioBuffer;
      } catch {
        // Return null to fallback to HTMLAudioElement
        return null;
      }
    }

    // Default embedded audio
    const b64 = EMBEDDED_AUDIO_BASE64[key];
    if (b64) {
      try {
        const arrayBuffer = base64ToArrayBuffer(b64);
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.decodedBuffers.set(key, audioBuffer);
        return audioBuffer;
      } catch {
        return null;
      }
    }

    return null;
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

    try {
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
    } catch {
      // AudioContext might be interrupted
    }
  }

  /**
   * Synthesized Sound: "BOING!"
   * Cheerful, gentle cartoon spring bounce when dropped incorrectly.
   */
  public playBoing() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
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
    } catch {
      // AudioContext might be interrupted
    }
  }

  /**
   * Sound: Victory celebration fanfare melody (2-3 seconds)
   */
  public playVictoryMusic() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
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
    } catch {
      // AudioContext might be interrupted
    }
  }

  /**
   * Sound: Gentle click / touch bubble pop
   */
  public playTouchPop() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
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
    } catch {
      // AudioContext might be interrupted
    }
  }

  /**
   * Resolve best audio source URL for a given sound key
   * Priority: Custom Teacher Recording -> Embedded Base64 Data URI -> Static File URL
   */
  public getAudioUrlForKey(key: string): { url: string; isCustom: boolean } {
    if (this.customAudioCache.has(key)) {
      return { url: this.customAudioCache.get(key)!, isCustom: true };
    }
    if (EMBEDDED_AUDIO_BASE64[key]) {
      return { url: EMBEDDED_AUDIO_BASE64[key], isCustom: false };
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

    const config = AUDIO_CONFIGS.find((c) => c.key === key);
    const text = config?.speechText || key;

    this.voiceQueue.push({ key, text, onEnd });
    this.processQueue();
  }

  /**
   * Play an isolated audio sample directly (for teacher testing in settings)
   */
  public async playSample(key: string): Promise<void> {
    await this.unlockAudio();
    return new Promise((resolve) => {
      this.playVoiceItem(key, () => resolve());
    });
  }

  /**
   * Play "Tích!" chime first, followed cleanly by the part's voice after 220ms
   */
  public playPartSuccess(key: string, onEnd?: () => void) {
    this.unlockAudio();
    this.playTick();
    setTimeout(() => {
      this.queueVoice(key, onEnd);
    }, 220);
  }

  /**
   * Play introduction voice when starting game
   */
  public playIntro(onEnd?: () => void) {
    this.unlockAudio();
    this.queueVoice('intro', onEnd);
  }

  /**
   * Play celebration congrats voice when all parts are placed
   */
  public playCongrats(onEnd?: () => void) {
    this.unlockAudio();
    // Play fanfare first
    this.playVictoryMusic();
    // After fanfare peaks (800ms), play congratulations voice
    setTimeout(() => {
      this.queueVoice('congrats', onEnd);
    }, 800);
  }

  /**
   * Plays a specific voice item with multi-tier fallback:
   * 1. Web Audio Buffer Source (pre-decoded buffer, 0 latency, immune to iOS autoplay)
   * 2. HTMLAudioElement (with embedded base64 URL or object URL)
   * 3. Web Speech API (with 2.5s maximum safety timeout)
   */
  private async playVoiceItem(key: string, onDone: () => void): Promise<void> {
    let hasResolved = false;
    const safeDone = () => {
      if (hasResolved) return;
      hasResolved = true;
      onDone();
    };

    // Watchdog timer: automatically resolve after 4 seconds to prevent ANY stuck audio
    const watchdog = setTimeout(() => {
      safeDone();
    }, 4000);

    const finish = () => {
      clearTimeout(watchdog);
      safeDone();
    };

    const ctx = this.getAudioContext();

    // Tier 1: Try Web Audio Buffer Source
    if (ctx && ctx.state === 'running') {
      try {
        const buffer = await this.getDecodedBuffer(key);
        if (buffer) {
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          this.currentBufferSource = source;
          source.onended = () => {
            this.currentBufferSource = null;
            finish();
          };
          source.start(0);
          return;
        }
      } catch {
        // Fall through to Tier 2
      }
    }

    // Tier 2: HTMLAudioElement with Base64 / Blob URL
    try {
      const { url } = this.getAudioUrlForKey(key);
      const audio = new Audio(url);
      this.currentAudioElement = audio;
      audio.volume = 1.0;

      audio.onended = () => {
        this.currentAudioElement = null;
        finish();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        const config = AUDIO_CONFIGS.find((c) => c.key === key);
        this.speakFallback(config?.speechText || key).then(finish);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.currentAudioElement = null;
          const config = AUDIO_CONFIGS.find((c) => c.key === key);
          this.speakFallback(config?.speechText || key).then(finish);
        });
      }
    } catch {
      const config = AUDIO_CONFIGS.find((c) => c.key === key);
      this.speakFallback(config?.speechText || key).then(finish);
    }
  }

  private processQueue() {
    if (this.isVoicePlaying || this.voiceQueue.length === 0 || !this.isSfxEnabled) {
      return;
    }

    const item = this.voiceQueue.shift()!;
    this.isVoicePlaying = true;

    // Safety watchdog for queue item: guaranteed cleanup within 4.5s
    if (this.queueWatchdogTimer) {
      clearTimeout(this.queueWatchdogTimer);
    }

    const handleEnd = () => {
      if (this.queueWatchdogTimer) {
        clearTimeout(this.queueWatchdogTimer);
        this.queueWatchdogTimer = null;
      }
      this.isVoicePlaying = false;
      this.currentAudioElement = null;
      this.currentBufferSource = null;
      if (item.onEnd) item.onEnd();
      // Small 100ms breathing room between sequential voices
      setTimeout(() => this.processQueue(), 100);
    };

    this.queueWatchdogTimer = setTimeout(() => {
      handleEnd();
    }, 4500);

    this.playVoiceItem(item.key, handleEnd);
  }

  private speakFallback(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // Safety timeout: never let SpeechSynthesis hang the app
      const timer = setTimeout(() => resolve(), 2200);

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.88; // Gentle nursery speed
        utterance.pitch = 1.05; // Friendly female pitch

        utterance.onend = () => {
          clearTimeout(timer);
          resolve();
        };
        utterance.onerror = () => {
          clearTimeout(timer);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        clearTimeout(timer);
        resolve();
      }
    });
  }

  public stopAllVoices() {
    this.voiceQueue = [];
    if (this.queueWatchdogTimer) {
      clearTimeout(this.queueWatchdogTimer);
      this.queueWatchdogTimer = null;
    }
    if (this.currentBufferSource) {
      try {
        this.currentBufferSource.stop();
      } catch {}
      this.currentBufferSource = null;
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    this.isVoicePlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const soundEngine = new SoundEngine();
