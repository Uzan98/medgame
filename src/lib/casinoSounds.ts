// Casino Sound Effects for MedTrivia
// Uses Web Audio API for lightweight, no-dependency sounds

class CasinoSounds {
    private audioContext: AudioContext | null = null;
    private isEnabled: boolean = true;

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    // Enable/disable sounds
    toggle(enabled: boolean) {
        this.isEnabled = enabled;
    }

    // Play a tone with given frequency and duration
    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
        if (!this.isEnabled) return;

        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    // Play multiple tones in sequence
    private playSequence(notes: Array<{ freq: number; dur: number; delay: number }>, type: OscillatorType = 'sine') {
        notes.forEach(({ freq, dur, delay }) => {
            setTimeout(() => this.playTone(freq, dur, type), delay * 1000);
        });
    }

    // 🎰 Wheel spinning sound - ticking that slows down
    spinWheel(duration: number = 3000) {
        if (!this.isEnabled) return;

        const tickCount = 30;
        const baseInterval = duration / tickCount;

        for (let i = 0; i < tickCount; i++) {
            // Slow down exponentially
            const progress = i / tickCount;
            const delay = baseInterval * i * (1 + progress * 2);

            if (delay < duration) {
                setTimeout(() => {
                    // Higher pitch at start, lower at end
                    const freq = 800 - (progress * 400);
                    this.playTone(freq, 0.05, 'square', 0.15);
                }, delay);
            }
        }
    }

    // ✅ Correct answer - happy ascending arpeggio
    correct() {
        this.playSequence([
            { freq: 523, dur: 0.1, delay: 0 },      // C5
            { freq: 659, dur: 0.1, delay: 0.08 },   // E5
            { freq: 784, dur: 0.15, delay: 0.16 },  // G5
            { freq: 1047, dur: 0.3, delay: 0.24 }   // C6
        ], 'sine');
    }

    // ❌ Wrong answer - descending buzz
    wrong() {
        this.playSequence([
            { freq: 200, dur: 0.15, delay: 0 },
            { freq: 150, dur: 0.2, delay: 0.1 }
        ], 'sawtooth');
    }

    // 👑 Crown earned - triumphant fanfare
    crownEarned() {
        this.playSequence([
            { freq: 523, dur: 0.1, delay: 0 },
            { freq: 659, dur: 0.1, delay: 0.1 },
            { freq: 784, dur: 0.1, delay: 0.2 },
            { freq: 1047, dur: 0.2, delay: 0.3 },
            { freq: 1319, dur: 0.4, delay: 0.5 }
        ], 'triangle');
    }

    // 🏆 Victory - epic win sound
    victory() {
        // Chord progression
        setTimeout(() => this.playTone(523, 0.3, 'sine', 0.25), 0);     // C
        setTimeout(() => this.playTone(659, 0.3, 'sine', 0.25), 0);     // E
        setTimeout(() => this.playTone(784, 0.3, 'sine', 0.25), 0);     // G

        setTimeout(() => this.playTone(587, 0.3, 'sine', 0.25), 300);   // D
        setTimeout(() => this.playTone(740, 0.3, 'sine', 0.25), 300);   // F#
        setTimeout(() => this.playTone(880, 0.3, 'sine', 0.25), 300);   // A

        setTimeout(() => this.playTone(523, 0.5, 'sine', 0.3), 600);    // C
        setTimeout(() => this.playTone(659, 0.5, 'sine', 0.3), 600);    // E
        setTimeout(() => this.playTone(784, 0.5, 'sine', 0.3), 600);    // G
        setTimeout(() => this.playTone(1047, 0.5, 'sine', 0.3), 600);   // C high
    }

    // 💔 Defeat - sad descending
    defeat() {
        this.playSequence([
            { freq: 400, dur: 0.2, delay: 0 },
            { freq: 350, dur: 0.2, delay: 0.2 },
            { freq: 300, dur: 0.3, delay: 0.4 },
            { freq: 200, dur: 0.5, delay: 0.7 }
        ], 'sine');
    }

    // 🎲 Button click
    click() {
        this.playTone(600, 0.05, 'sine', 0.1);
    }

    // ⏰ Time warning (last 5 seconds)
    timeWarning() {
        this.playTone(880, 0.1, 'square', 0.15);
    }

    // 💰 Coins earned - plays coins.mp3
    coins() {
        if (!this.isEnabled) return;
        try {
            const audio = new Audio('/coins.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Coin sound failed:', e));
        } catch (e) {
            console.warn('Coin sound error:', e);
        }
    }
}

// Singleton instance
export const casinoSounds = new CasinoSounds();
