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
                    if (this.state.portrait && !this.state.records.includes('portrait_back')) this.state.records.push('portrait_back');
                    if (!this.state.portrait) this.state.records = this.state.records.filter(id => id !== 'portrait_back');
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
        guidance(stage = 0) {
            if (this.state.opened) return { text: '门闩已经松开。沿走廊走到门外的石路，靠近门槛后再决定是否离开。' };
            const read = id => this.state.records.includes(id);
            if (stage <= 0) {
                let text;
                if (!read('letter')) text = '回头看看入口右手边的小木架，那里留着一封信。靠近并看向它，再按 E 或点击调查提示。';
                else if (!read('lock')) text = '地上的红绳一直延进走廊。沿着它走，先看看尽头的门被什么扣住了。';
                else if (!read('coffin')) text = '沿红绳回到正厅，绕到棺木旁，低头看看棺沿刻下的字。';
                else if (!read('wall_marks')) text = '回到走廊时，留意右侧木墙上的身高刻线。刻线旁还有一行小字。';
                else if (!read('altar')) text = '供桌香炉旁压着一张旧纸。把它和已经见到的刻字放在一起想。';
                else text = '棺沿说了左右两位，身高线旁的小字说了中间。回查手记，把它们对应到门上的三个铜轮。';
                return { text, next: '对照已读字迹' };
            }
            if (stage === 1) {
                const evidence = [];
                if (read('coffin')) evidence.push('棺沿的「左位留灯，右位留门」，已经确定了左右两轮。');
                if (read('wall_marks')) evidence.push('身高线旁的「站在灯和门之间的，是回家的人」，说的是中轮。');
                if (read('altar')) evidence.push('旧纸的「雨留在外，不入三位」，说明雨字不用放入这三轮。');
                if (!evidence.length) evidence.push('手记里还没有能确定字轮位置的字迹。先找正厅的棺沿、供桌旧纸，或走廊右侧的身高线。');
                return { text: evidence.join('\n\n') + '\n\n转轮之后还要主动压下门闩；读完字迹不会自动开门。', next: '直接查看字轮答案' };
            }
            return { text: '从左到右调成「灯 · 人 · 门」，再压下门闩。\n\n每轮依次经过雨、门、人、灯。如果三轮都还停在雨字，左轮转三格，中轮转两格，右轮转一格。' };
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
