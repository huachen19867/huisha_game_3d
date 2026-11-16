(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const SAVE_KEY = 'huisha.3d.homecoming.v1';
    const symbols = ['雨', '门', '人', '灯'];
    class ThreeStory {
        constructor(storage) {
            this.state = { records: [], wheels: [0, 0, 0], opened: false, portrait: false, ending: false, position: null };
            this.saveAvailable = true;
            try {
                this.storage = storage || global.localStorage;
                const saved = JSON.parse(this.storage.getItem(SAVE_KEY) || 'null');
                if (saved && saved.version === 1) {
                    this.state.records = [...new Set((Array.isArray(saved.records) ? saved.records : []).filter(id =>
                        game.MAIN_HALL_MAP.interactables.some(item => item.id === id) || id === 'portrait_back'))];
                    if (Array.isArray(saved.wheels) && saved.wheels.length === 3) {
                        this.state.wheels = saved.wheels.map(value => Number.isInteger(value) && value >= 0 && value < 4 ? value : 0);
                    }
                    this.state.opened = saved.opened === true;
                    this.state.portrait = saved.portrait === true;
                    this.state.ending = saved.ending === true && this.state.opened;
                    const p = saved.position;
                    if (p && [p.x, p.z, p.yaw, p.pitch].every(Number.isFinite)) this.state.position = p;
                }
            } catch (_) { this.saveAvailable = false; }
        }
        record(id) {
            if (!this.state.records.includes(id)) this.state.records.push(id);
            this.save();
        }
        revealPortrait() { this.state.portrait = true; this.record('portrait_back'); }
        rotate(index) {
            if (this.state.opened || !Number.isInteger(index) || index < 0 || index > 2) return;
            this.state.wheels[index] = (this.state.wheels[index] + 1) % symbols.length;
            this.save();
        }
        unlock() {
            if (this.state.wheels.map(value => symbols[value]).join('') !== '灯人门') return false;
            this.state.opened = true;
            this.save();
            return true;
        }
        finish() {
            if (!this.state.opened) return false;
            this.state.ending = true;
            this.save();
            return true;
        }
        objective() {
            if (this.state.ending) return '归门 · 已走过门槛，可以继续回看这座旧宅';
            if (this.state.opened) return '门闩已经松开 · 穿过走廊，决定是否离开';
            if (this.state.records.includes('lock')) return '三枚字轮 · 对照旧宅里的字迹，尝试松开门闩';
            return '母亲的来信让你回到旧宅 · 找到走廊尽头的出路';
        }
        save(position) {
            if (position) this.state.position = position;
            try { this.storage.setItem(SAVE_KEY, JSON.stringify({ version: 1, ...this.state })); this.saveAvailable = true; }
            catch (_) { this.saveAvailable = false; }
        }
        reset() {
            this.state = { records: [], wheels: [0, 0, 0], opened: false, portrait: false, ending: false, position: null };
            this.save();
        }
    }
    ThreeStory.symbols = symbols;
    game.ThreeStory = ThreeStory;
})(window);
