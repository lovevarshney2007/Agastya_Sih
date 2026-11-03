/**
 * Digital India "Bhashini" Voice Assist & Speech Synthesis Engine
 * Provides accessibility and multilingual audio readout using standard Web Speech API.
 * Supports Hindi, Indian English, Marathi, and Tamil voice synthesis.
 */

export type SupportedLanguage = 'en-IN' | 'hi-IN' | 'mr-IN' | 'ta-IN';

export interface BhashiniVoiceOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const BHASHINI_LANGUAGES: BhashiniVoiceOption[] = [
  { code: 'en-IN', name: 'English (India)', nativeName: 'English (IN)', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
];

class BhashiniVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isBrowserSupported = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isBrowserSupported = true;
    }
  }

  public isSupported(): boolean {
    return this.isBrowserSupported;
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public speak(
    text: string,
    lang: SupportedLanguage = 'en-IN',
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (!this.synth) {
      options?.onError?.(new Error('Speech synthesis not supported in this browser environment.'));
      return;
    }

    // Cancel ongoing speech
    this.stop();

    // Clean markdown formatting (remove bold **, bullets •, # headings) for natural speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/[•\-*]\s+/g, ', ')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = options?.rate || 0.95; // Slightly slower for clarity
    utterance.pitch = options?.pitch || 1.0;

    // Pick best matching voice
    const voices = this.synth.getVoices();
    const voiceMatch = voices.find(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options?.onError?.(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
}

export const bhashiniVoice = new BhashiniVoiceEngine();
