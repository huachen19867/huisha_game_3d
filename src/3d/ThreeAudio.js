(function (global) {
    const game = global.Huisha3D;
    const sampleNames = [
        ...['wood', 'concrete'].flatMap(surface => [0, 1, 2].map(index => `footstep_${surface}_00${index}`)),
        'impactMetal_light_000', 'impactMetal_light_001', 'impactWood_light_000'
    ];
    // Beats, MIDI notes and dynamics. Empty bars let the last string decay into the room.
    const scores={
        road:{beat:.69,length:32,notes:[[0,50,.62],[1.5,57,.42],[3,62,.68],[5,64,.37],[7,57,.53],[12,55,.56],[13.5,62,.42],[16,60,.64],[19,57,.46],[23,50,.62]]},
        home:{beat:.82,length:40,notes:[[0,38,.58],[.08,62,.66],[2,65,.54],[3.5,67,.40],[6,60,.49],[8,57,.55],[13,43,.4],[14,55,.48],[17,60,.5],[20,62,.60],[23.5,57,.3],[28,50,.52]]},
        memory:{beat:.78,length:32,notes:[[0,43,.44],[.12,67,.45],[2,69,.36],[5,62,.55],[8,64,.41],[11,60,.48],[16,38,.42],[18,57,.47],[20,60,.49],[23,62,.61]]},
        chase:{beat:.32,length:16,notes:[[0,38,.72],[1.5,38,.48],[3,41,.65],[4,38,.50],[6,48,.6],[7.5,39,.6],[9,38,.78],[11,45,.52],[12,41,.61],[14.5,37,.57]]}
    };
    class ThreeAudio {
        constructor() {
            this.muted = false; this.volume = 1; this.musicMix=.72;this.rainMix=.43; this.distance = 0; this.steps = 0; this.turns = 0; this.samples = new Map();
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
                    const volume = this.context.createGain(); volume.gain.value = 0;
                    rain.connect(filter); filter.connect(volume); volume.connect(this.gain); rain.start(); this.rain = rain;
                    this.rainFilter = filter; this.rainGain = volume; this.applySoundscape(true); this.loadSamples();
                    this.musicBus=this.context.createGain();this.musicBus.gain.value=.78*this.musicMix;this.musicBus.connect(this.gain);
                    this.loadInstruments();
                    this.musicClock=global.setInterval(()=>this.scheduleMusic(),100);
                }
                this.context.resume()?.catch?.(() => {});
            } catch (_) { /* Sound is optional; exploration remains available. */ }
        }
        async loadInstruments() {
            this.musicAbort=new AbortController();
            await Promise.allSettled(['harp-d4','bass-d1'].map(async id=>{
                const response=await global.fetch('assets/audio/vsco/'+id+'.wav',{signal:this.musicAbort.signal});
                if(!response.ok)return;
                const sample=await this.context.decodeAudioData(await response.arrayBuffer());
                if(!this.disposed)this.samples.set(id,sample);
            }));
        }
        setScore(name) {
            if(name===this.scoreName)return;
            this.scoreName=name;this.musicIndex=0;this.musicBar=(this.context?.currentTime||0)+.18;
            if(!this.musicBus)return;
            // Fade the previous room, including notes already scheduled during the lookahead.
            const old=this.musicBus,now=this.context.currentTime;
            old.gain.setTargetAtTime(.0001,now,.10);
            global.setTimeout(()=>old.disconnect(),850);
            this.musicBus=this.context.createGain();this.musicBus.gain.value=.78*this.musicMix;this.musicBus.connect(this.gain);
        }
        scheduleMusic() {
            const ctx=this.context,score=scores[this.scoreName];
            if(!score || !this.musicBus || this.muted || ctx?.state!=='running')return;
            const now=ctx.currentTime;
            if(this.musicBar+score.length*score.beat<now){this.musicBar=now;this.musicIndex=0;}
            while(true){
                const [beat,note,strength]=score.notes[this.musicIndex];
                const at=this.musicBar+beat*score.beat;
                if(at>now+.24)return;
                if(at>=now-.10)this.playNote(note,strength,Math.max(now,at));
                if(++this.musicIndex===score.notes.length){this.musicIndex=0;this.musicBar+=score.length*score.beat;}
            }
        }
        playNote(note,strength,at) {
            const ctx=this.context,bass=note<49,buffer=this.samples.get(bass?'bass-d1':'harp-d4');
            const voice=buffer?ctx.createBufferSource():ctx.createOscillator(),level=ctx.createGain();
            const duration=this.scoreName==='chase'?.54:bass?2.5:3.8;
            if(buffer){voice.buffer=buffer;voice.playbackRate.value=2**((note-(bass?26:62))/12);}
            else {voice.type='triangle';voice.frequency.value=440*2**((note-69)/12);}
            level.gain.setValueAtTime(.0001,at);
            level.gain.exponentialRampToValueAtTime(strength*(buffer ? .85 : .36),at+.015);
            level.gain.exponentialRampToValueAtTime(.0001,at+duration);
            voice.connect(level);level.connect(this.musicBus);voice.onended=()=>{voice.disconnect();level.disconnect();};
            voice.start(at);voice.stop(at+duration+.02);
        }
        brake() {
            this.noiseBurst(.48,.6,1900,'bandpass');this.tone(480,.32,.18);
        }
        swingDoor(closing) {
            this.noiseBurst(.39,.23,closing?610:880,'bandpass');
            if(closing)this.knock();else this.latch();
        }
        startEngine() {
            if (this.muted || !this.gain || this.engine) return;
            this.setScore('road');
            const ctx = this.context, engine = ctx.createOscillator(), level = ctx.createGain();
            engine.type = 'triangle'; engine.frequency.setValueAtTime(69,ctx.currentTime);
            level.gain.value = .23; engine.connect(level); level.connect(this.gain);
            engine.onended = () => { engine.disconnect(); level.disconnect(); };
            engine.start(); this.engine = engine;
            const radio=ctx.createBufferSource();radio.buffer=this.noise;radio.loop=true;
            const tuning=ctx.createBiquadFilter();tuning.type='bandpass';tuning.frequency.value=1320;tuning.Q.value=7;
            const radioGain=ctx.createGain();radioGain.gain.value=.16;
            radio.connect(tuning);tuning.connect(radioGain);radioGain.connect(this.gain);
            radio.onended=()=>{radio.disconnect();tuning.disconnect();radioGain.disconnect();};
            radio.start();this.radio=radio;
        }
        silenceRadio() {
            if(this.scoreName==='road')this.setScore(null);
            if(this.radio){this.radio.stop();this.radio=null;}
        }
        stopEngine() {
            this.silenceRadio();
            if (this.engine) {this.engine.stop(); this.engine = null;}
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
        sample(name, volume = 0.5, pan) {
            const buffer = this.samples.get(name);
            if (!buffer || this.muted || this.context?.state !== 'running') return false;
            const source = this.context.createBufferSource(), gain = this.context.createGain(); source.buffer = buffer;
            gain.gain.value = volume; source.connect(gain);
            const panner = Number.isFinite(pan) && this.context.createStereoPanner ? this.context.createStereoPanner() : null;
            if (panner) { panner.pan.value = Math.max(-1,Math.min(1,pan)); gain.connect(panner); panner.connect(this.gain); }
            else gain.connect(this.gain);
            source.start();
            source.onended = () => { source.disconnect(); gain.disconnect(); panner?.disconnect(); };
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
        watchStep(pan, near) {
            if (!this.sample(near ? 'footstep_concrete_002' : 'footstep_concrete_001', near ? .92 : .52, pan))
                this.tone(near ? 72 : 102, near ? .21 : .12, near ? .21 : .1);
        }
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
            this.rainGain.gain.setTargetAtTime(sound.rain*this.rainMix, this.context.currentTime, 0.35);
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
        setMix(music,rain) {
            if(this.musicMix!==music){
                this.musicMix=music;
                this.musicBus?.gain.setTargetAtTime(.78*music,this.context.currentTime,.06);
            }
            if(this.rainMix!==rain){this.rainMix=rain;this.applySoundscape(true);}
        }
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
        dispose() { global.clearInterval?.(this.musicClock);this.musicAbort?.abort();this.stopEngine(); this.disposed = true; this.sampleAbort?.abort(); this.samples.clear(); this.rain?.stop(); this.context?.close()?.catch?.(() => {}); }
    }
    global.Huisha3D.ThreeAudio = ThreeAudio;
})(window);
