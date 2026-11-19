(function (global) {
    const game = global.Huisha3D;
    const KEY = 'huisha.3d.preferences.v1';
    const defaults = { brightness: 1.28, mouseSensitivity: 1, touchSensitivity: 1, invertY: false, pointerLock: true, muted: false, volume: 1, rainMix: .43, musicMix: .72 };
    const bounds = { brightness: [0.8, 1.8], mouseSensitivity: [0.25, 3], touchSensitivity: [0.25, 3], volume: [0, 1], rainMix: [0, 1], musicMix: [0, 1] };
    class ThreePreferences {
        constructor(storage) {
            this.values = { ...defaults }; this.saveAvailable = true;
            let serialized;
            try { this.storage = storage || global.localStorage; serialized = this.storage.getItem(KEY); }
            catch (_) { this.saveAvailable = false; }
            try {
                const saved = JSON.parse(serialized || 'null');
                if (saved?.version === 1) for (const name of Object.keys(defaults)) this.assign(name, saved[name]);
            } catch (_) { /* Invalid settings use defaults without discarding the story save. */ }
        }
        assign(name, value) {
            if (!Object.hasOwn(defaults, name)) return false;
            if (bounds[name]) {
                if (!Number.isFinite(value)) return false;
                const [min, max] = bounds[name]; value = Math.max(min, Math.min(max, value));
            } else if (typeof value !== 'boolean') return false;
            this.values[name] = value; return true;
        }
        set(name, value) { if (!this.assign(name, value)) return false; this.save(); return true; }
        save() {
            try { this.storage.setItem(KEY, JSON.stringify({ version: 1, ...this.values })); this.saveAvailable = true; }
            catch (_) { this.saveAvailable = false; }
        }
        reset() { Object.assign(this.values, defaults); this.save(); }
    }
    game.ThreePreferences = ThreePreferences;
})(window);
