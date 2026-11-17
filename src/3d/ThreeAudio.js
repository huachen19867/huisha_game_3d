(function (global) {
    const game = global.Huisha3D;
    const sampleNames = [
        ...['wood', 'concrete'].flatMap(surface => [0, 1, 2].map(index => `footstep_${surface}_00${index}`)),
        'impactMetal_light_000', 'impactMetal_light_001', 'impactWood_light_000'
    ];
    class ThreeAudio {
        constructor() {
            this.muted = false; this.volume = 1; this.distance = 0; this.steps = 0; this.turns = 0; this.samples = new Map();
            this.indoor = { surface: 'wood', rain: 0.04, cutoff: 650 };
        }
        start() {
            if (this.muted) return;
            try {
                if (!this.context) {
                    const Audio = global.AudioContext || global.webkitAudioContext;
                    if (!Audio) return;
                    this.context = new Audio();
                    this.gain = this.context.createGain(); this.gain.gain.value = 0.24 * this.volume; this.gain.connect(this.context.destination);
                    const buffer = this.context.createBuffer(1, this.context.sampleRate * 3, this.context.sampleRate);
                    const samples = buffer.getChannelData(0);
                    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
                    this.noise = buffer;
                    const rain = this.context.createBufferSource(); rain.buffer = buffer; rain.loop = true;
                    const filter = this.context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800;
                    const volume = this.context.createGain(); volume.gain.value = 0.08;
                    rain.connect(filter); filter.connect(volume); volume.connect(this.gain); rain.start(); this.rain = rain;
                    this.rainFilter = filter; this.rainGain = volume; this.applySoundscape(true); this.loadSamples();
                }
                this.context.resume()?.catch?.(() => {});
            } catch (_) { /* Sound is optional; exploration remains available. */ }
        }
        loadSamples() {
            if (this.loading || !global.fetch) return this.loading;
            const context = this.context;
            this.sampleAbort = global.AbortController ? new global.AbortController() : null;
            this.loading = Promise.allSettled(sampleNames.map(async name => {
                const response = await global.fetch(`assets/audio/kenney-impact/${name}.ogg`, { signal: this.sampleAbort?.signal });
                if (!response.ok) throw new Error(`Audio HTTP ${response.status}`);
                const buffer = await context.decodeAudioData(await response.arrayBuffer());
                if (!this.disposed) this.samples.set(name, buffer);
            }));
            return this.loading;
        }
        sample(name, volume = 0.5) {
            const buffer = this.samples.get(name);
            if (!buffer || this.muted || this.context?.state !== 'running') return false;
            const source = this.context.createBufferSource(), gain = this.context.createGain(); source.buffer = buffer;
            gain.gain.value = volume; source.connect(gain); gain.connect(this.gain); source.start();
            source.onended = () => { source.disconnect(); gain.disconnect(); };
            return true;
        }
        noiseBurst(duration, volume, frequency, type = 'lowpass') {
            if (!this.noise || this.muted || this.context?.state !== 'running') return;
            const source = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain();
            const now = this.context.currentTime; source.buffer = this.noise;
            filter.type = type; filter.frequency.value = frequency; filter.Q.value = 0.5;
            gain.gain.setValueAtTime(0.001, now); gain.gain.linearRampToValueAtTime(volume, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            source.connect(filter); filter.connect(gain); gain.connect(this.gain);
            source.start(now, Math.random(), duration);
            source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
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
        knock() { if (!this.sample('impactWood_light_000', 0.45)) this.tone(160, 0.1, 0.15); }
        latch() { if (!this.sample(`impactMetal_light_00${this.turns++ % 2}`, 0.4)) this.tone(760, 0.08, 0.1); }
        paper() { this.noiseBurst(0.16, 0.07, 1400, 'highpass'); }
        water(action) { this.noiseBurst(action === 'fill' ? 0.6 : 0.4, 0.13, action === 'empty' ? 1100 : 2100); }
        release() { this.latch(); this.knock(); }
        chime() { this.tone(528, 1.2, 0.14); }
        soundscape(position, space) {
            return game.MEMORIES?.[space]?.audio || game.WORLD_MAP?.audioZones?.find(zone =>
                position.x >= zone.xMin && position.x <= zone.xMax && position.z >= zone.zMin && position.z <= zone.zMax)?.audio || this.indoor;
        }
        applySoundscape(force = false) {
            const sound = this.currentSoundscape || this.indoor;
            if (!this.rainGain || (!force && sound === this.appliedSoundscape)) return;
            this.rainGain.gain.setTargetAtTime(sound.rain, this.context.currentTime, 0.35);
            this.rainFilter.frequency.setTargetAtTime(sound.cutoff, this.context.currentTime, 0.35);
            this.appliedSoundscape = sound;
        }
        step(surface) {
            const index = this.steps++ % 3;
            if (!this.sample(`footstep_${surface}_00${index}`, 0.6)) this.tone(surface === 'wood' ? 95 : 75, 0.12, 0.12);
        }
        update(position, paused, space = 'house') {
            if (!position) return;
            if (space !== this.space) { this.resetPosition(); this.space = space; }
            this.currentSoundscape = this.soundscape(position, space); this.applySoundscape();
            if (!paused && this.last) {
                const distance = Math.hypot(position.x - this.last.x, position.z - this.last.z);
                // Portal/camera jumps are not footsteps, even if a caller missed resetPosition().
                this.distance = distance > 2 ? 0 : this.distance + distance;
                if (this.distance > 0.85) { this.step(this.currentSoundscape.surface); this.distance %= 0.85; }
            }
            this.last = { x: position.x, z: position.z };
        }
        pause() { this.context?.suspend()?.catch?.(() => {}); }
        resetPosition() { this.last = null; this.distance = 0; }
        setVolume(value) {
            if (!Number.isFinite(value)) return;
            this.volume = Math.max(0, Math.min(1, value));
            if (this.gain) this.gain.gain.setTargetAtTime(0.24 * this.volume, this.context.currentTime, 0.03);
        }
        setMuted(value, resume = true) {
            const changed = this.muted !== value; this.muted = value;
            if (value) this.pause(); else if (changed && resume) this.start();
        }
        toggle() { this.setMuted(!this.muted); }
        dispose() { this.disposed = true; this.sampleAbort?.abort(); this.samples.clear(); this.rain?.stop(); this.context?.close()?.catch?.(() => {}); }
    }
    global.Huisha3D.ThreeAudio = ThreeAudio;
})(window);
