(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const SAVE_KEY = 'huisha.3d.homecoming.v1';
    const symbols = ['雨', '门', '人', '灯'];
    const freshState = () => ({ arrival: 'intro', busCalled: false, records: [], pinnedRecords: [], visitedAreas: [], wheels: [0, 0, 0], opened: false, portrait: false, portraitBackRead: false, ending: false,
        courtyard: false, crossedYard: false, buckets: [0, 0], waterSolved: false, departure: null, position: null, lamp: 'altar', shielded: false,
        memory: null, memoryReturn: null, phoneViews: [], documentViews: {}, reasoningRevision: 2, deductions: { school: false, hospital: false, crash: false }, drafts: {} });
    const validPose = pose => pose && [pose.x, pose.z, pose.yaw, pose.pitch].every(Number.isFinite);
    class ThreeStory {
        constructor(storage) {
            this.state = freshState();
            this.saveAvailable = true;
            try {
                this.storage = storage || global.localStorage;
                const saved = JSON.parse(this.storage.getItem(SAVE_KEY) || 'null');
                if (saved && saved.version === 1) {
                    this.state.arrival = ['intro', 'letter', 'ledger', 'keys', 'gate', 'home'].includes(saved.arrival)
                        ? saved.arrival : 'home';
                    this.state.records = [...new Set((Array.isArray(saved.records) ? saved.records : []).filter(id =>
                        (game.WORLD_MAP || game.MAIN_HALL_MAP).interactables.some(item => item.id === id) || id === 'portrait_back'))];
                    if (Array.isArray(saved.wheels) && saved.wheels.length === 3) {
                        this.state.wheels = saved.wheels.map(value => Number.isInteger(value) && value >= 0 && value < 4 ? value : 0);
                    }
                    this.state.opened = saved.opened === true;
                    if (this.state.opened && saved.lamp === 'hook') this.state.lamp = 'hook';
                    if (!this.state.opened && ['lit', 'out'].includes(saved.lamp)) this.state.lamp = saved.lamp;
                    this.state.shielded = this.state.lamp === 'lit' && saved.shielded === true;
                    this.state.portrait = saved.portrait === true;
                    this.state.portraitBackRead = this.state.portrait && (saved.portraitBackRead === true || !Object.hasOwn(saved, 'portraitBackRead'));
                    if (this.state.portraitBackRead && !this.state.records.includes('portrait_back')) this.state.records.push('portrait_back');
                    if (!this.state.portraitBackRead) this.state.records = this.state.records.filter(id => id !== 'portrait_back');
                    this.state.ending = saved.ending === true && this.state.opened;
                    this.state.courtyard = saved.courtyard === true && this.state.opened;
                    if (Array.isArray(saved.buckets) && saved.buckets.length === 2) {
                        this.state.buckets = saved.buckets.map((value, index) =>
                            Number.isInteger(value) && value >= 0 && value <= (index ? 5 : 3) ? value : 0);
                    }
                    this.state.waterSolved = saved.waterSolved === true && this.state.opened;
                    this.state.busCalled = this.state.waterSolved && (saved.busCalled === true || saved.departure === 'leave');
                    if (this.state.waterSolved) this.state.buckets[1] = 4;
                    if (!this.state.waterSolved) this.state.records = this.state.records.filter(id =>
                        !(game.WORLD_MAP || game.MAIN_HALL_MAP).interactables.find(item => item.id === id)?.requiresWater);
                    this.state.phoneViews = !this.state.waterSolved ? [] : !Object.hasOwn(saved, 'phoneViews') && this.state.records.includes('crash_phone')
                        ? Object.keys(game.PHONE_PAGES) : [...new Set((Array.isArray(saved.phoneViews) ? saved.phoneViews : [])
                            .filter(page => typeof page === 'string' && Object.hasOwn(game.PHONE_PAGES, page)))];
                    if (!this.state.phoneViews.length) this.state.records = this.state.records.filter(id => id !== 'crash_phone');
                    else if (!this.state.records.includes('crash_phone')) this.state.records.push('crash_phone');
                    for (const [id, document] of Object.entries(game.DOCUMENTS)) {
                        const hadWholeRecord = this.state.records.includes(id) && (!Object.hasOwn(saved, 'documentViews')
                            || (document.introducedRevision === 2 && saved.reasoningRevision !== 2 && !Object.hasOwn(saved.documentViews || {}, id)));
                        this.state.documentViews[id] = !this.state.waterSolved ? [] : hadWholeRecord
                            ? Object.keys(document.faces) : [...new Set((Array.isArray(saved.documentViews?.[id]) ? saved.documentViews[id] : [])
                                .filter(face => typeof face === 'string' && Object.hasOwn(document.faces, face)))];
                        if (!this.state.documentViews[id].length) this.state.records = this.state.records.filter(record => record !== id);
                        else if (!this.state.records.includes(id)) this.state.records.push(id);
                    }
                    this.state.pinnedRecords = [...new Set((Array.isArray(saved.pinnedRecords) ? saved.pinnedRecords : [])
                        .filter(id => this.state.records.includes(id)))].slice(0, 2);
                    for (const [id, definition] of Object.entries(game.MEMORY_CASES || {})) {
                        this.state.deductions[id] = this.state.waterSolved && saved.deductions?.[id] === true
                            && definition.records.every(record => this.state.records.includes(record))
                            && definition.facts.every(fact => (!fact.phonePage && !fact.documentFace) || this.knowsFact(fact))
                            && this.missingDocumentFaces(definition).length === 0;
                        const draft = saved.drafts?.[id];
                        const questionChanged = draft?.questionChanged === true || (saved.reasoningRevision !== 2 && Number.isInteger(draft?.interpretation));
                        this.state.drafts[id] = this.cleanDraft(id, draft?.evidence, saved.reasoningRevision === 2 ? draft?.interpretation : null, draft?.timeline, questionChanged);
                    }
                    if (this.state.waterSolved && typeof saved.memory === 'string' && Object.hasOwn(game.MEMORIES || {}, saved.memory)) {
                        this.state.memory = saved.memory;
                        this.state.memoryReturn = validPose(saved.memoryReturn) ? saved.memoryReturn : { x: 8.5, z: -20.4, yaw: Math.PI, pitch: 0 };
                    }
                    if (this.state.waterSolved && (['leave', 'stay'].includes(saved.departure)
                        || (this.truthSolved() && ['wake', 'remember'].includes(saved.departure)))) this.state.departure = saved.departure;
                    const p = saved.position;
                    if (p && [p.x, p.z, p.yaw, p.pitch].every(Number.isFinite)) this.state.position = p;
                    this.state.visitedAreas = [...new Set((Array.isArray(saved.visitedAreas) ? saved.visitedAreas : []).filter(id =>
                        game.ThreeExplorationMap.allowed(game.ThreeExplorationMap.areas().find(area => area.id === id), this.state)))];
                    for (const id of this.state.records) this.markArea(this.recordArea(id));
                    this.state.crossedYard = this.state.opened && (saved.crossedYard === true || this.state.waterSolved || this.state.visitedAreas.includes('kitchen'));
                }
            } catch (_) { this.saveAvailable = false; }
        }
        record(id) {
            if (!this.state.records.includes(id)) this.state.records.push(id);
            this.markArea(this.recordArea(id));
            this.save();
        }
        readPhonePage(page) {
            if (!this.state.waterSolved || this.state.memory !== 'crash' || typeof page !== 'string' || !Object.hasOwn(game.PHONE_PAGES, page)) return false;
            if (!this.state.phoneViews.includes(page)) this.state.phoneViews.push(page);
            this.record('crash_phone'); return true;
        }
        phoneText() { return this.state.phoneViews.map(page => `${game.PHONE_PAGES[page].title}\n\n${game.PHONE_PAGES[page].text}`).join('\n\n'); }
        hasDocumentFace(id, face) { return this.state.documentViews[id]?.includes(face) === true; }
        documentComplete(id) { return Object.keys(game.DOCUMENTS[id].faces).every(face => this.hasDocumentFace(id, face)); }
        missingDocumentFaces(definition) { return Object.entries(definition.requiredFaces || {}).flatMap(([record, faces]) =>
            faces.filter(face => !this.hasDocumentFace(record, face)).map(face => ({ record, face }))); }
        readDocumentFace(id, face) {
            const definition = typeof id === 'string' && Object.hasOwn(game.DOCUMENTS, id) ? game.DOCUMENTS[id] : null;
            if (!definition || !this.state.waterSolved || this.state.memory !== definition.space || typeof face !== 'string' || !Object.hasOwn(definition.faces, face)) return false;
            const views = this.state.documentViews[id] ||= []; if (!views.includes(face)) views.push(face);
            this.record(id); return true;
        }
        documentText(id) { return (this.state.documentViews[id] || []).map(face => `${game.DOCUMENTS[id].faces[face].title}\n\n${game.DOCUMENTS[id].faces[face].text}`).join('\n\n'); }
        knowsFact(fact) { return this.state.records.includes(fact.record) && (!fact.phonePage || this.state.phoneViews.includes(fact.phonePage))
            && (!fact.documentFace || this.hasDocumentFace(fact.record, fact.documentFace)); }
        recordArea(id) {
            return id === 'portrait_back' ? 'hall' : (game.WORLD_MAP || game.MAIN_HALL_MAP).interactables.find(item => item.id === id)?.area;
        }
        markArea(id) {
            const area = game.ThreeExplorationMap.areas().find(area => area.id === id);
            if (!game.ThreeExplorationMap.allowed(area, this.state) || this.state.visitedAreas.includes(id)) return false;
            this.state.visitedAreas.push(id); return true;
        }
        visitPosition(pose) {
            const area = game.ThreeExplorationMap.areaAt(pose, this.state.memory || 'house', this.state);
            if (!area || !this.markArea(area.id)) return false;
            this.save(); return true;
        }
        togglePin(id) {
            if (!this.state.records.includes(id)) return false;
            if (this.state.pinnedRecords.includes(id)) this.state.pinnedRecords = this.state.pinnedRecords.filter(record => record !== id);
            else {
                if (this.state.pinnedRecords.length >= 2) return false;
                this.state.pinnedRecords.push(id);
            }
            this.save(); return true;
        }
        revealPortrait() { if (this.state.portrait) return false; this.state.portrait = true; this.save(); return true; }
        readPortraitBack() {
            if (!this.state.portrait) return false;
            this.state.portraitBackRead = true; this.record('portrait_back'); return true;
        }
        rotate(index) {
            if (this.state.opened || !Number.isInteger(index) || index < 0 || index > 2) return;
            this.state.wheels[index] = (this.state.wheels[index] + 1) % symbols.length;
            this.save();
        }
        unlock() {
            if (this.state.wheels.map(value => symbols[value]).join('') !== '灯人门') return false;
            this.state.lamp = 'altar'; this.state.shielded = false;
            this.state.opened = true;
            this.save();
            return true;
        }
        takeLamp() {
            if (this.state.opened || this.state.memory || this.state.lamp === 'lit') return false;
            this.state.lamp = 'lit'; this.state.shielded = false; this.save(); return true;
        }
        inDraft({x,z}) { return z < -4.1 && z > -6.5 && x < .49; }
        crossDraft(pose) {
            if (this.state.lamp !== 'lit' || this.state.shielded || !this.inDraft(pose)) return false;
            this.state.lamp = 'out'; this.save(pose); return true;
        }
        hangLamp() {
            if (this.state.opened || this.state.lamp !== 'lit') return false;
            this.state.lamp = 'hook'; this.state.shielded = false; this.state.opened = true; this.save(); return true;
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
        signalBus(direction) {
            if (!this.state.waterSolved || this.state.memory || direction !== 'bridge') return false;
            this.state.busCalled = true; this.save(); return true;
        }
        depart(choice) {
            if (!this.state.waterSolved) return false;
            if (['wake', 'remember'].includes(choice)) {
                if (!this.truthSolved() || this.state.memory !== 'crash') return false;
            } else if (!['leave', 'stay'].includes(choice) || this.state.memory) return false;
            if (choice === 'leave' && !this.state.busCalled) return false;
            this.state.departure = choice; this.save(); return true;
        }
        enterMemory(id, pose) {
            if (!this.state.waterSolved || this.state.memory || typeof id !== 'string' || !Object.hasOwn(game.MEMORIES || {}, id) || !validPose(pose)) return false;
            this.state.memoryReturn = { ...pose }; this.state.memory = id;
            this.state.position = { ...game.MEMORIES[id].start }; this.markArea(id); this.save(); return true;
        }
        leaveMemory() {
            if (!this.state.memory) return null;
            const pose = this.state.memoryReturn || { x: 8.5, z: -20.4, yaw: Math.PI, pitch: 0 };
            this.state.memory = null; this.state.memoryReturn = null; this.state.position = { ...pose }; this.save(); return pose;
        }
        cleanDraft(id, evidence, interpretation, timeline, questionChanged = false) {
            return { evidence: [0, 1].map(index => Array.isArray(evidence) && this.state.records.includes(evidence[index]) ? evidence[index] : ''),
                interpretation: Number.isInteger(interpretation) && interpretation >= 0 && interpretation < (game.MEMORY_CASES?.[id]?.choices.length || 0) ? interpretation : null,
                questionChanged: questionChanged === true && (interpretation === null || interpretation === undefined),
                timeline: [...new Set((Array.isArray(timeline) ? timeline : []).filter(event => {
                    const fact = game.MEMORY_CASES?.[id]?.facts.find(fact => fact.id === event);
                    return fact && this.knowsFact(fact);
                }))] };
        }
        setMemoryDraft(id, evidence, interpretation, timeline) {
            if (typeof id !== 'string' || !Object.hasOwn(game.MEMORY_CASES || {}, id)) return;
            this.state.drafts[id] = this.cleanDraft(id, evidence, interpretation, timeline === undefined ? this.state.drafts[id]?.timeline : timeline, this.state.drafts[id]?.questionChanged); this.save();
        }
        deduce(id) {
            const definition = typeof id === 'string' && Object.hasOwn(game.MEMORY_CASES || {}, id) ? game.MEMORY_CASES[id] : null, draft = this.state.drafts[id];
            if (!definition || !draft) return { success: false, message: '先选出两份记录，再试着解释它们。' };
            if (this.state.deductions[id]) return { success: true, message: definition.conclusion };
            const evidence = draft.evidence;
            if (!evidence[0] || !evidence[1] || evidence[0] === evidence[1]) return { success: false, message: '需要两份不同的已读记录。草稿仍保留着。' };
            const mismatch = { success: false, message: '这两份记录与判断还不能相互支持。留意日期、签字和原文；可以保留草稿，回去再看。' };
            if (!this.state.waterSolved || !evidence.every(record => this.state.records.includes(record))) return mismatch;
            const timeline = draft.timeline || [];
            if (timeline.some(event => definition.facts.find(fact => fact.id === event)?.dated === false)) {
                return { success: false, message: '时间线里有缺少明确日期的片段，暂时不能据此确定先后。可以先把它放回旁边。草稿还在。' };
            }
            if (!definition.records.every(record => evidence.includes(record))) return mismatch;
            const missingFaces = this.missingDocumentFaces(definition);
            if (missingFaces.length) {
                return { success: false, message: `「${game.DOCUMENTS[missingFaces[0].record].title}」还有没有读过的一面。翻看并核对日期、签字与原话；草稿仍保留着。` };
            }
            if (definition.facts.some(fact => fact.phonePage && !this.knowsFact(fact))) {
                return { success: false, message: '手机还有没有记下的页面。把通话记录与本地录音资料分别阅读，再回到这份草稿。' };
            }
            if (!timeline.length) return { success: false, message: '先把能确定时间的原文片段放上时间线，按从早到晚排列。选好解释后还要主动提交。' };
            if (timeline.length !== definition.timelineOrder.length || !definition.timelineOrder.every((event, index) => event === timeline[index])) {
                return { success: false, message: '时间线的先后还对不上。回看原文里的年份、日期和时刻。'
                    + (id === 'crash' ? '文件保存的旧语音与今夜拨出的电话也要分开。' : '') + '草稿仍保留着。' };
            }
            if (draft.interpretation !== definition.answer) return { success: false, message: '时间已经排好，但当前判断与两份原文还不能相互支持。留意日期、签字和原话，不把猜想当成已经发生的事实。' };
            this.state.deductions[id] = true; this.save(); return { success: true, message: definition.conclusion };
        }
        truthSolved() { return ['school', 'hospital', 'crash'].every(id => this.state.deductions[id]); }
        arrivalTask() {
            return {
                intro: '开车回村，查清是谁寄了这封信。',
                letter: '走到身旁的车窗前，查看信封上的旧门牌。',
                ledger: '沿路往老宅走，在右手亮灯的值班室查换牌登记簿。',
                keys: '去前门对面的木柜，按登记簿上的新门牌取钥匙。横木可以跳过，也可以从旁边绕过去。',
                gate: '拿钥匙打开路尽头挂着「十四号」牌子的老宅前门。'
            }[this.state.arrival];
        }
        advanceArrival(from, to) {
            if (this.state.arrival !== from) return false;
            this.state.arrival = to;
            this.save();
            return true;
        }
        objective() {
            if (this.arrivalTask()) return this.arrivalTask();
            if (this.state.memory && ['wake', 'remember'].includes(this.state.departure)) return '已经作出去向选择 · 可以继续回看，或从暂停回到厨房';
            if (this.state.memory) {
                if (this.state.memory === 'crash' && this.truthSolved()) return '救护灯另一边还有人在叫你 · 靠近灯，主动决定去向';
                return this.state.deductions[this.state.memory] ? '这段记忆已核对 · 可以继续观察，或从门边 / 暂停回到厨房'
                    : this.memoryTask(this.state.memory);
            }
            if (this.state.departure) return { leave: '归路 · 你已走出旧宅，可以继续回看', stay: '余温 · 今晚留下是你的选择，可以继续回看',
                wake: '破茧 · 你回应了救护灯，可以继续回看', remember: '回煞 · 你选择留在记忆，可以继续回看' }[this.state.departure];
            if (this.state.waterSolved && this.state.busCalled) return '接驳车停在山路尽头。去站牌旁上车，或回厨房翻相册。';
            if (this.state.waterSolved && this.state.records.includes('bus_notice')) return '沿护栏走到候车棚。按接驳通知，把反光牌转向来车方向。';
            if (this.state.waterSolved) return this.state.records.includes('medicine_letter')
                ? '要查车祸，翻厨房柜边的相册，里面有三段记忆。要下山，出院门看路口的接驳通知。' : '量水秤压平了 · 查看打开的抽屉，院门也已松开';
            if (this.state.courtyard) return this.state.crossedYard ? '去厨房量水桌，用三升、五升桶量出四升水，再把五升桶放上秤。' : '走到右边有灶火的厨房。院里的灯扫过来时，先停步。';
            if (this.state.ending || this.state.opened) return '后门已开。穿过走廊进雨庭，往右手亮灯的厨房走。';
            if (this.state.lamp === 'out') return '灯芯灭了。回供桌借烛火，或用门上的字轮开门。';
            if (this.state.lamp === 'lit') return '端灯走到走廊尽头。经过左手破窗时按 F 护火，到门前调查门闩。';
            if (this.state.records.includes('lock')) return !this.state.records.includes('coffin') ? '去正厅查看棺沿刻字，找出左右两个字轮的位置。'
                : !this.state.records.includes('wall_marks') ? '沿走廊看右墙身高线，找出中间那个字，再去门上转字轮。' : '对照棺沿和身高线，把走廊尽头的三个字轮调好，压下门闩。';
            return '进正厅，绕过棺木，去左侧供桌端灯。走廊尽头的后门锁着。';
        }
        memoryTask(id) {
            const routes = {
                school: [['school_notice','去左侧课桌看录取通知'],['school_receipt','去右侧课桌看家长回执']],
                hospital: [['hospital_record','去右前方桌上看初诊病历'],['hospital_plan','去左侧轮椅旁看复诊安排']],
                crash: [['crash_phone','在左侧石头上拿起手机'],['crash_report','到前方右侧查看救护交接单']]
            };
            for (const [record, direction] of routes[id]) {
                if (record === 'crash_phone') {
                    if (this.state.phoneViews.length < 2) return direction + '，分别记下通话记录和录音资料。';
                } else if (game.DOCUMENTS[record]) {
                    if (!this.documentComplete(record)) return direction + '，翻面并分别点「阅读」。';
                } else if (!this.state.records.includes(record)) return direction + '，记下时间。';
            }
            return '按 J 打开手记，点「整理」：选两份记录，按日期排序，再提交判断。';
        }
        guidance(stage = 0) {
            if (this.arrivalTask()) return { text: this.arrivalTask() };
            if (this.state.memory) return this.memoryGuidance(stage);
            if (this.state.waterSolved) return { text: '打开桌下抽屉看家书。想查当晚的事就翻厨房柜边的相册。要下山就出院门看通知，到候车棚把反光牌转向来车，再去尽头上车。' };
            if (this.state.courtyard) return this.waterGuidance(stage);
            if (this.state.opened) return { text: '门闩已经松开。沿走廊走到门外的石路，再走入雨庭。右手边的厨房还亮着一盏灯。' };
            if (this.state.lamp === 'out' || this.state.lamp === 'lit') return { text: this.objective() };
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
                if (read('altar')) evidence.push('供桌上的修锁便条写着「三个字轮不用雨字」，说明雨字可以排除。');
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
        memoryGuidance(stage) {
            const id = this.state.memory, definition = game.MEMORY_CASES[id];
            if (id === 'crash' && this.truthSolved()) return { text: '三段记忆已经核对。继续走向路尽头的红蓝救护灯，靠近后主动决定是否回应。也可以先回厨房。' };
            if (this.state.deductions[id]) return { text: definition.conclusion + '\n\n可以继续观察，或从门边、暂停菜单回到厨房。' };
            if (stage === 0) return { text: { school: '近处左侧课桌留着录取通知，远处右侧课桌有家长回执。拿近并翻看正反面，再用“整理记忆”核对。',
                hospital: '看看右前方桌上的初诊病历，再去左侧轮椅旁拿近复诊安排。比较年份，核对签字和背面的复诊办法。',
                crash: '来路左侧石块上有手机，前方右侧放着救护交接单。拿近手机，分别查看通话记录和本地录音资料，留意日期。' }[id], next: '再想一想原文' };
            if (stage === 1) return { text: '选两份不同的已读原文，把有明确日期的片段从早到晚放上时间线，再选择解释。没有具体日期的描述或猜想，可以先留在旁边。选好后仍需主动提交。', next: '直接查看这段推理做法' };
            const titles = definition.records.map(record => game.WORLD_MAP.interactables.find(item => item.id === record).title);
            const sequence = definition.timelineOrder.map(event => { const fact = definition.facts.find(fact => fact.id === event); return `${fact.title}：${fact.quote}`; });
            return { text: `对照「${titles[0]}」和「${titles[1]}」，从早到晚排列：\n\n${sequence.join('\n\n')}\n\n再选择解释：\n\n${definition.choices[definition.answer]}\n\n没有观察过的记录仍须回到场景中调查，提示不会替你加入手记、排列时间线或完成推理。` };
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
