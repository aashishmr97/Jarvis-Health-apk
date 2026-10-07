// Voice Coach and Sound Synthesizer for JARVIS
export class VoiceCoachService {
  private static audioCtx: AudioContext | null = null;
  private static recognition: any = null;
  private static isListening: boolean = false;

  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesize rest countdown beep (800Hz / 1200Hz high tone for GO!)
   */
  static playRestBeep(isFinal: boolean = false): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 1046.5 : 587.3, ctx.currentTime); // C6 or D5

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (isFinal ? 0.4 : 0.18));
    } catch (e) {
      console.warn('Audio synth failed', e);
    }
  }

  /**
   * Speak coaching feedback using SpeechSynthesis
   */
  static speak(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Cancel any lingering utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95; // Slightly lower, authoritative trainer tone

      // Try selecting a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('Alex')) &&
        v.lang.startsWith('en')
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }

  /**
   * Start Speech Recognition listener
   */
  static startListening(
    onResult: (transcript: string) => void,
    onError?: (err: any) => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('SpeechRecognition not supported in this browser.');
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Speech recognition init failed', e);
      return false;
    }
  }

  static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}
