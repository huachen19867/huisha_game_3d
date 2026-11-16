(function (global) {
    class ThreeAudio {
        constructor() { this.muted = false; this.distance = 0; }
        start() {
            if (this.muted) return;
            try {
                if (!this.context) {
                    const Audio = global.AudioContext || global.webkitAudioContext;
                    if (!Audio) return;
                    this.context = new Audio();
                    this.gain = this.context.createGain(); this.gain.gain.value = 0.24; this.gain.connect(this.context.destination);
                    const buffer = this.context.createBuffer(1, this.context.sampleRate * 3, this.context.sampleRate);
                    const samples = buffer.getChannelData(0);
                    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
                    this.noise = buffer;
                    const rain = this.context.createBufferSource(); rain.buffer = buffer; rain.loop = true;
                    const filter = this.context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800;
                    const volume = this.context.createGain(); volume.gain.value = 0.08;
                    rain.connect(filter); filter.connect(volume); volume.connect(this.gain); rain.start(); this.rain = rain;
                }
                this.context.resume()?.catch?.(() => {});
            } catch (_) { /* Sound is optional; exploration remains available. */ }
        }
        tone(frequency, duration, volume) {
            if (!this.context || this.muted || this.context.state !== 'running') return;
            const oscillator = this.context.createOscillator(), gain = this.context.createGain(), now = this.context.currentTime;
            oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, now);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.6, now + duration);
            gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            oscillator.connect(gain); gain.connect(this.gain); oscillator.start(); oscillator.stop(now + duration);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        }
        knock() { this.tone(160, 0.1, 0.22); }
        chime() { this.tone(528, 1.2, 0.14); }
        update(position, paused) {
            if (!position) return;
            if (!paused && this.last) {
                this.distance += Math.hypot(position.x - this.last.x, position.z - this.last.z);
                if (this.distance > 0.85) { this.tone(85, 0.14, 0.2); this.distance = 0; }
            }
            this.last = { x: position.x, z: position.z };
        }
        pause() { this.context?.suspend()?.catch?.(() => {}); }
        toggle() { this.muted = !this.muted; this.muted ? this.pause() : this.start(); }
        dispose() { this.rain?.stop(); this.context?.close()?.catch?.(() => {}); }
    }
    global.Huisha3D.ThreeAudio = ThreeAudio;
})(window);
