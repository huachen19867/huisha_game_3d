(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const SAVE_KEY = 'huisha.3d.homecoming.v1';
    const symbols = ['雨', '门', '人', '灯'];
    const freshState = () => ({ records: [], wheels: [0, 0, 0], opened: false, portrait: false, ending: false,
        courtyard: false, buckets: [0, 0], waterSolved: false, departure: null, position: null });
    class ThreeStory {
        constructor(storage) {
            this.state = freshState();
            this.saveAvailable = true;
            try {
                this.storage = storage || global.localStorage;
                const saved = JSON.parse(this.storage.getItem(SAVE_KEY) || 'null');
                if (saved && saved.version === 1) {
                    this.state.records = [...new Set((Array.isArray(saved.records) ? saved.records : []).filter(id =>
                        (game.WORLD_MAP || game.MAIN_HALL_MAP).interactables.some(item => item.id === id) || id === 'portrait_back'))];
                    if (Array.isArray(saved.wheels) && saved.wheels.length === 3) {
                        this.state.wheels = saved.wheels.map(value => Number.isInteger(value) && value >= 0 && value < 4 ? value : 0);
                    }
                    this.state.opened = saved.opened === true;
                    this.state.portrait = saved.portrait === true;
                    if (this.state.portrait && !this.state.records.includes('portrait_back')) this.state.records.push('portrait_back');
                    if (!this.state.portrait) this.state.records = this.state.records.filter(id => id !== 'portrait_back');
                    this.state.ending = saved.ending === true && this.state.opened;
                    this.state.courtyard = saved.courtyard === true && this.state.opened;
                    if (Array.isArray(saved.buckets) && saved.buckets.length === 2) {
                        this.state.buckets = saved.buckets.map((value, index) =>
                            Number.isInteger(value) && value >= 0 && value <= (index ? 5 : 3) ? value : 0);
                    }
                    this.state.waterSolved = saved.waterSolved === true && this.state.opened;
                    if (this.state.waterSolved) this.state.buckets[1] = 4;
                    if (this.state.waterSolved && ['leave', 'stay'].includes(saved.departure)) this.state.departure = saved.departure;
                    if (!this.state.waterSolved) this.state.records = this.state.records.filter(id => !['medicine_letter', 'road_exit'].includes(id));
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
        enterCourtyard() {
            if (!this.state.opened || this.state.courtyard) return false;
            this.state.courtyard = true; this.save(); return true;
        }
        canUseBucket(index) { return this.state.opened && !this.state.waterSolved && (index === 0 || index === 1); }
        fillBucket(index) {
            if (!this.canUseBucket(index)) return false;
            const capacity = index ? 5 : 3;
            if (this.state.buckets[index] === capacity) return false;
            this.state.buckets[index] = capacity; this.save(); return true;
        }
        emptyBucket(index) {
            if (!this.canUseBucket(index) || this.state.buckets[index] === 0) return false;
            this.state.buckets[index] = 0; this.save(); return true;
        }
        pourBucket(index) {
            if (!this.canUseBucket(index)) return 0;
            const target = 1 - index, capacity = target ? 5 : 3;
            const amount = Math.min(this.state.buckets[index], capacity - this.state.buckets[target]);
            if (!amount) return 0;
            this.state.buckets[index] -= amount; this.state.buckets[target] += amount; this.save(); return amount;
        }
        weighWater() {
            if (!this.state.opened || this.state.waterSolved || this.state.buckets[1] !== 4) return false;
            this.state.waterSolved = true; this.save(); return true;
        }
        depart(choice) {
            if (!this.state.waterSolved || !['leave', 'stay'].includes(choice)) return false;
            this.state.departure = choice; this.save(); return true;
        }
        objective() {
            if (this.state.departure) return this.state.departure === 'leave' ? '归路 · 你已走出旧宅，可以继续回看' : '余温 · 今晚留下是你的选择，可以继续回看';
            if (this.state.waterSolved) return this.state.records.includes('medicine_letter')
                ? '院门松开了 · 穿过雨庭，在山路上决定去留' : '量水秤压平了 · 查看打开的抽屉，院门也已松开';
            if (this.state.courtyard) return '厨房还有一盏灯 · 观察提桶刻度，用水压平旧秤';
            if (this.state.ending || this.state.opened) return '门闩已经松开 · 穿过走廊，走入雨庭';
            if (this.state.records.includes('lock')) return '三枚字轮 · 对照旧宅里的字迹，尝试松开门闩';
            return '母亲的来信让你回到旧宅 · 找到走廊尽头的出路';
        }
        guidance(stage = 0) {
            if (this.state.waterSolved) return { text: '量水秤已经压平，桌下的抽屉打开了。低头查看抽屉里的家书；厨房外的院门也松开了，可从雨庭走向山路。' };
            if (this.state.courtyard) return this.waterGuidance(stage);
            if (this.state.opened) return { text: '门闩已经松开。沿走廊走到门外的石路，再走入雨庭。右手边的厨房还亮着一盏灯。' };
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
        waterGuidance(stage) {
            if (stage <= 0) return { text: this.state.records.includes('kitchen_note')
                ? '靠近厨房靠里的量水桌，看看桶身刻度和写着四升的秤盘。添满、倒空、两桶互倒都可以反复尝试。'
                : '先去右手边的厨房。灶旁墙上留着一张校秤纸，桌上的提桶和秤盘也有刻度。', next: '想一想量水办法' };
            if (stage === 1) return { text: '三升和五升的差是两升。先把五升桶倒进空的三升桶，就能在大桶里留下两升。\n\n试着把这两升留在小桶里：下一次添满大桶时，小桶还差多少才满？', next: '直接查看量水做法' };
            return { text: '从两桶空着开始：\n\n添满五升桶 → 倒入三升桶，余二升。\n倒空三升桶 → 把余下二升倒入小桶。\n再添满五升桶 → 倒入小桶，补上它缺的一升。\n\n五升桶里现在恰好四升。把它放上秤盘。' };
        }
        save(position) {
            if (position) this.state.position = position;
            try { this.storage.setItem(SAVE_KEY, JSON.stringify({ version: 1, ...this.state })); this.saveAvailable = true; }
            catch (_) { this.saveAvailable = false; }
        }
        reset() {
            this.state = freshState();
            this.save();
        }
    }
    ThreeStory.symbols = symbols;
    game.ThreeStory = ThreeStory;
})(window);
