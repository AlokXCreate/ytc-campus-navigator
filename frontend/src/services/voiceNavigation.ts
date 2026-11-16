/**
 * Voice Navigation Service for YTC Campus Navigator
 * Grounded in the Web Speech API (SpeechSynthesis)
 * Provides real-time spoken turn-by-turn guidance, haptic vibration, and audio prompts.
 */

class VoiceNavigationService {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastAnnouncedText: string = '';
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initVoice();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer English (India) or clear English (US/UK)
    this.selectedVoice =
      voices.find((v) => v.lang.includes('en-IN') || v.name.includes('India')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public speak(text: string, force: boolean = false) {
    if (this.isMuted && !force) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.currentUtterance = null;
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      this.lastAnnouncedText = text;
      window.speechSynthesis.speak(utterance);

      // Trigger haptic vibration on mobile devices (short pulse)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch (e) {
      console.warn('Voice navigation speech error:', e);
    }
  }

  public announceRouteStart(destName: string, distanceMeters: number, timeMinutes: number) {
    const text = `Starting navigation to ${destName}. Distance is approximately ${distanceMeters} meters, about ${timeMinutes} minute walk. Follow the blue path.`;
    this.speak(text);
  }

  public announceManeuver(instruction: string, distanceToTurnMeters?: number) {
    let text = instruction;
    if (distanceToTurnMeters && distanceToTurnMeters > 0) {
      text = `In ${Math.round(distanceToTurnMeters)} meters, ${instruction}`;
    }
    this.speak(text);
  }

  public announceArrival(destName: string) {
    const text = `You have arrived at your destination: ${destName}.`;
    this.speak(text);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 100, 250]);
    }
  }

  public repeatLastAnnouncement() {
    if (this.lastAnnouncedText) {
      this.speak(this.lastAnnouncedText, true);
    }
  }
}

export const voiceNavigation = new VoiceNavigationService();
