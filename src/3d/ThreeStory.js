(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D || (global.Huisha3D = {});
    const SAVE_KEY = 'huisha.3d.homecoming.v1';
    const symbols = [copyText('story.symbols'), copyText('story.symbols.2'), copyText('story.symbols.3'), copyText('story.symbols.4')];
    const freshState = () => ({ arrival: 'intro', chapterEdition: 2, basketDown:false, cellarOpen:false, filterClear:false, sumpDrained:false, oldCoffinLatch:false, gear: [], wardrobeOpen: false, chestOpen: false, calibrated: false, vigil: 0, coffinOpen: false, photoFiled:false, busCalled: false, records: [], pinnedRecords: [], visitedAreas: [], wheels: [0, 0, 0], opened: false, portrait: false, portraitBackRead: false, ending: false,
        courtyard: false, crossedYard: false, wellEscaped:false, maskHung:false, formJoined:false, buckets: [0, 0], waterSolved: false, departure: null, rememberPlace:null, position: null, lamp: 'altar', shielded: false,
        memory: null, memoryReturn: null, phoneViews: [], documentViews: {}, fareTinOpen: false, heightStripTaken: false, riceStage:'covered', porkOnRice:false, leakMuffled:false, stoveLit:false, reasoningRevision: 2, deductions: { school: false, hospital: false, crash: false }, drafts: {} });
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
                    const legacy = !saved.chapterEdition && this.state.waterSolved;
                    this.state.oldCoffinLatch = saved.oldCoffinLatch === true || legacy || (saved.chapterEdition===1 && saved.vigil>0);
                    this.state.wardrobeOpen = this.state.opened && saved.wardrobeOpen === true;
                    this.state.chestOpen = this.state.opened && saved.chestOpen === true;
                    this.state.gear = [...new Set((Array.isArray(saved.gear) ? saved.gear : []).filter(id => ['weight','rice','matches','paper','cellarKey','coffinKey'].includes(id)))];
                    this.state.basketDown = this.state.opened && (saved.basketDown===true || this.state.gear.includes('paper'));
                    this.state.cellarOpen = this.state.wardrobeOpen && saved.cellarOpen===true;
                    this.state.filterClear = this.state.cellarOpen && saved.filterClear===true;
                    this.state.sumpDrained = this.state.filterClear && saved.sumpDrained===true;
                    this.state.calibrated = this.state.waterSolved || (this.state.opened && saved.calibrated === true);
                    this.state.vigil = legacy ? 3 : Number.isInteger(saved.vigil) ? Math.max(0, Math.min(3, saved.vigil)) : 0;
                    const sawOldMeal = !Object.hasOwn(saved,'riceStage') && this.state.records.includes('rice_bowl');
                    if (this.state.opened) {
                        if (this.state.gear.includes('rice') || this.state.vigil > 0 || sawOldMeal) this.state.riceStage = 'served';
                        else if (['empty','served'].includes(saved.riceStage)) this.state.riceStage = saved.riceStage;
                        this.state.porkOnRice = this.state.riceStage==='served' && saved.porkOnRice===true;
                        this.state.leakMuffled = saved.leakMuffled === true && this.state.records.includes('leak_basin');
                    }
                    this.state.coffinOpen = legacy || (this.state.vigil === 3 && saved.coffinOpen === true);
                    // Earlier saves awarded the coat, photograph and album access together.
                    const hadPhoto=this.state.coffinOpen && !Object.hasOwn(saved,'photoFiled');
                    if(hadPhoto) {
                        for(const id of ['uniform_collar','bend_photo'])
                            if(!this.state.records.includes(id)) this.state.records.push(id);
                    }
                    this.state.photoFiled=this.state.coffinOpen && this.state.records.includes('bend_photo') && (hadPhoto || saved.photoFiled===true);
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
                    this.state.fareTinOpen = this.state.waterSolved && (saved.fareTinOpen === true || this.state.records.includes('hospital_fare'));
                    this.state.heightStripTaken = saved.heightStripTaken === true && this.state.records.includes('wall_marks');
                    this.state.formJoined=this.state.waterSolved && (saved.formJoined===true || this.state.records.includes('school_draft'));
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
                    this.state.stoveLit = this.state.waterSolved && (saved.stoveLit === true ||
                        (!Object.hasOwn(saved,'stoveLit') && this.state.departure === 'stay'));
                    if(this.state.departure==='remember' && (saved.rememberPlace==='kitchen' ||
                        (saved.rememberPlace==='bridge' && this.state.records.includes('bridge_post')))) this.state.rememberPlace=saved.rememberPlace;
                    const p = saved.position;
                    if (p && [p.x, p.z, p.yaw, p.pitch].every(Number.isFinite)) this.state.position = p;
                    this.state.visitedAreas = [...new Set((Array.isArray(saved.visitedAreas) ? saved.visitedAreas : []).filter(id =>
                        game.ThreeExplorationMap.allowed(game.ThreeExplorationMap.areas().find(area => area.id === id), this.state)))];
                    for (const id of this.state.records) this.markArea(this.recordArea(id));
                    this.state.crossedYard = this.state.opened && (saved.crossedYard === true || this.state.waterSolved || this.state.visitedAreas.includes('kitchen'));
                    this.state.wellEscaped=this.state.opened && saved.wellEscaped===true;
                    this.state.maskHung = this.state.crossedYard && this.state.records.includes('mask_strap') && saved.maskHung===true;
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
            if(id==='school_draft' && !this.state.formJoined) return false;
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
            if (!this.state.wheels.every((value,index)=>value===[3,2,1][index])) return false;
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
        carried() {
            const s=this.state, ids=[];
            if(s.arrival !== 'intro') ids.push('envelope');
            if(s.arrival !== 'intro' && (s.riceStage!=='served' || s.gear.includes('rice') || s.vigil>0)) ids.push('lunchbox');
            if(s.arrival === 'gate' || (s.arrival === 'home' && s.records.includes('key_board'))) ids.push('key');
            if(['lit','out'].includes(s.lamp)) ids.push('lamp');
            if(s.records.includes('medicine_letter')) ids.push('familyLetter');
            for(const id of s.gear) {
                if(id==='weight' && s.calibrated || id==='rice' && s.vigil>=1 || id==='paper' && s.vigil>=3) continue;
                ids.push(id);
            }
            if(s.records.includes('uniform_collar')) ids.push('uniform');
            if(s.heightStripTaken) ids.push('heightStrip');
            if(s.records.includes('bend_photo') && !s.photoFiled) ids.push('roadPhoto');
            return ids;
        }
        takeGear(id) {
            const s=this.state;
            if(!s.opened || s.memory || s.gear.includes(id)) return false;
            if(!({weight:s.wardrobeOpen,matches:s.wardrobeOpen,rice:s.riceStage==='served' && s.vigil===0,paper:s.basketDown,cellarKey:s.chestOpen,coffinKey:s.sumpDrained})[id]) return false;
            s.gear.push(id); this.save(); return true;
        }
        offer(id) {
            const s=this.state;
            if (!s.opened || ['rice','matches','paper'][s.vigil] !== id || !this.carried().includes(id)) return false;
            s.vigil++; this.save(); return true;
        }
        weighWater() {
            if (!this.state.calibrated || !this.state.opened || this.state.waterSolved || this.state.buckets[1] !== 4) return false;
            this.state.waterSolved = true; this.save(); return true;
        }
        signalBus(direction) {
            if (!this.state.waterSolved || this.state.memory || direction !== 'bridge') return false;
            this.state.busCalled = true; this.save(); return true;
        }
        depart(choice,place) {
            if (!this.state.waterSolved) return false;
            if (['wake', 'remember'].includes(choice)) {
                if (!this.truthSolved() || this.state.memory !== 'crash') return false;
            } else if (!['leave', 'stay'].includes(choice) || this.state.memory) return false;
            if (choice === 'leave' && !this.state.busCalled) return false;
            if(choice==='remember' && place==='bridge' && !this.state.records.includes('bridge_post')) return false;
            this.state.rememberPlace=choice==='remember' ? (place==='bridge'?'bridge':'kitchen') : null;
            if (choice === 'stay' && this.state.gear.includes('matches')) this.state.stoveLit = true;
            this.state.departure = choice; this.save(); return true;
        }
        enterMemory(id, pose) {
            if (!this.state.waterSolved || this.state.memory || typeof id !== 'string' || !Object.hasOwn(game.MEMORIES || {}, id) || !validPose(pose)) return false;
            if (id === 'crash' && !this.state.photoFiled) return false;
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
        conclusionFor(id){
            const base=game.MEMORY_CASES[id].conclusion;
            if (id === 'hospital' && this.state.records.includes('hospital_fare'))
                return base + copyText('story.conclusionfor');
            if(id!=='school' || !this.hasDocumentFace('school_draft','front')) return base;
            return base+copyText('story.conclusionfor.2');
        }
        deduce(id) {
            const definition = typeof id === 'string' && Object.hasOwn(game.MEMORY_CASES || {}, id) ? game.MEMORY_CASES[id] : null, draft = this.state.drafts[id];
            if (!definition || !draft) return { success: false, message: copyText('story.deduce.message') };
            if (this.state.deductions[id]) return { success: true, message: this.conclusionFor(id) };
            const evidence = draft.evidence;
            if (!evidence[0] || !evidence[1] || evidence[0] === evidence[1]) return { success: false, message: copyText('story.deduce.message.2') };
            const mismatch = { success: false, message: copyText('story.deduce.message.3') };
            if (!this.state.waterSolved || !evidence.every(record => this.state.records.includes(record))) return mismatch;
            const timeline = draft.timeline || [];
            if (timeline.some(event => definition.facts.find(fact => fact.id === event)?.dated === false)) {
                return { success: false, message: copyText('story.deduce.message.4') };
            }
            if (!definition.records.every(record => evidence.includes(record))) return mismatch;
            const missingFaces = this.missingDocumentFaces(definition);
            if (missingFaces.length) {
                return { success: false, message: copyText('story.deduce.message.5', game.DOCUMENTS[missingFaces[0].record].title) };
            }
            if (definition.facts.some(fact => fact.phonePage && !this.knowsFact(fact))) {
                return { success: false, message: copyText('story.deduce.message.6') };
            }
            if (!timeline.length) return { success: false, message: copyText('story.deduce.message.7') };
            if (timeline.length !== definition.timelineOrder.length || !definition.timelineOrder.every((event, index) => event === timeline[index])) {
                return { success: false, message: copyText('story.deduce.message.8')
                    + (id === 'crash' ? copyText('story.deduce.message.9') : '') + copyText('story.deduce.message.10') };
            }
            if (draft.interpretation !== definition.answer) return { success: false, message: copyText('story.deduce.message.11') };
            this.state.deductions[id] = true; this.save(); return { success: true, message: this.conclusionFor(id) };
        }
        truthSolved() { return ['school', 'hospital', 'crash'].every(id => this.state.deductions[id]); }
        arrivalTask() {
            return {
                intro: copyText('story.arrivaltask.intro'),
                letter: copyText('story.arrivaltask.letter'),
                ledger: copyText('story.arrivaltask.ledger'),
                keys: copyText('story.arrivaltask.keys'),
                gate: copyText('story.arrivaltask.gate')
            }[this.state.arrival];
        }
        advanceArrival(from, to) {
            if (this.state.arrival !== from) return false;
            this.state.arrival = to;
            this.save();
            return true;
        }
        headline(pose) {
            const s=this.state;
            if(this.arrivalTask()) return {intro:copyText('story.headline.intro'),letter:copyText('story.headline.letter'),ledger:copyText('story.headline.ledger'),keys:copyText('story.headline.keys'),gate:copyText('story.headline.gate')}[s.arrival];
            if(s.departure) return this.objective();
            if (s.memory) {
                if (s.memory === 'crash' && this.truthSolved()) return copyText('story.headline');
                if (s.deductions[s.memory]) return copyText('story.headline.2');
                return {school:copyText('story.headline.school'), hospital:copyText('story.headline.hospital'), crash:copyText('story.headline.crash')}[s.memory];
            }
            const area=game.ThreeExplorationMap.areaAt(pose,'house',s)?.id;
            if(area==='attic'||area==='attic_steps') return s.gear.includes('paper')?copyText('story.headline.3'):copyText('story.headline.4');
            if(area==='cellar'||area==='cellar_steps') return s.gear.includes('coffinKey')?copyText('story.headline.5'):s.sumpDrained?copyText('story.headline.6'):copyText('story.headline.7');
            if(area==='workshop' && !s.gear.includes('weight')) return copyText('story.headline.8');
            if(area==='west_room' && !s.wardrobeOpen) return copyText('story.headline.9');
            if(s.waterSolved && s.coffinOpen && !s.photoFiled) return s.records.includes('bend_photo')?copyText('story.headline.10'):copyText('story.headline.11');
            if(s.waterSolved) return s.coffinOpen ? copyText('story.headline.12') : copyText('story.headline.13');
            if(area==='yard' && !s.records.includes('yard_well')) return copyText('story.headline.14');
            if(s.courtyard) return !s.calibrated ? copyText('story.headline.15') : copyText('story.headline.16');
            if (!s.opened && s.lamp === 'altar' && s.records.includes('key_board') && !s.records.includes('wall_marks')) return copyText('story.headline.17');
            if (!s.opened && s.lamp === 'altar' && s.records.includes('wall_marks')) return copyText('story.headline.18');
            return s.opened ? copyText('story.headline.19') : copyText('story.headline.20');
        }
        objective() {
            if (this.arrivalTask()) return this.arrivalTask();
            if(this.state.departure==='remember' && this.state.rememberPlace) return this.state.rememberPlace==='bridge'?copyText('story.objective'):copyText('story.objective.2');
            if (this.state.memory && ['wake', 'remember'].includes(this.state.departure)) return copyText('story.objective.3');
            if (this.state.memory) {
                if (this.state.memory === 'crash' && this.truthSolved()) return copyText('story.objective.4');
                return this.state.deductions[this.state.memory] ? copyText('story.objective.5')
                    : this.memoryTask(this.state.memory);
            }
            if (this.state.departure) return { leave: copyText('story.objective.leave'), stay: copyText('story.objective.stay'),
                wake: copyText('story.objective.wake'), remember: copyText('story.objective.remember') }[this.state.departure];
            if(this.state.waterSolved && this.state.coffinOpen && !this.state.photoFiled && !this.state.busCalled) {
                if(this.state.records.includes('bend_photo')) return copyText('story.objective.6');
                return this.state.records.includes('uniform_collar')?copyText('story.objective.7'):copyText('story.objective.8');
            }
            if(this.state.waterSolved && !this.state.coffinOpen && !this.state.records.includes('bus_notice') && !this.state.busCalled)
                return this.state.vigil === 3 ? (this.state.oldCoffinLatch || this.state.gear.includes('coffinKey') ? copyText('story.objective.9') : copyText('story.objective.10')) : copyText('story.objective.11');
            if (this.state.waterSolved && this.state.busCalled) return copyText('story.objective.12');
            if (this.state.waterSolved && this.state.records.includes('bus_notice')) return copyText('story.objective.13');
            if (this.state.waterSolved) return this.state.records.includes('medicine_letter')
                ? copyText('story.objective.14') : copyText('story.objective.15');
            if(this.state.courtyard && !this.state.calibrated) return this.state.gear.includes('weight') ? copyText('story.objective.16') : copyText('story.objective.17');
            if (this.state.courtyard) return this.state.crossedYard ? copyText('story.objective.18') : copyText('story.objective.19');
            if (this.state.ending || this.state.opened) return copyText('story.objective.20');
            if (this.state.lamp === 'out') return copyText('story.objective.21');
            if (this.state.lamp === 'lit') return copyText('story.objective.22');
            if (this.state.records.includes('lock')) return copyText('story.objective.23');
            return copyText('story.objective.24');
        }
        memoryTask(id) {
            const routes = {
                school: [['school_notice',copyText('story.memorytask.school')],['school_receipt',copyText('story.memorytask.school.2')]],
                hospital: [['hospital_record',copyText('story.memorytask.hospital')],['hospital_plan',copyText('story.memorytask.hospital.2')]],
                crash: [['crash_phone',copyText('story.memorytask.crash')],['crash_report',copyText('story.memorytask.crash.2')]]
            };
            for (const [record, direction] of routes[id]) {
                if (record === 'crash_phone') {
                    if (this.state.phoneViews.length < 2) return direction + copyText('story.memorytask');
                } else if (game.DOCUMENTS[record]) {
                    const needed = game.MEMORY_CASES[id].requiredFaces[record];
                    if (needed.some(face => !this.hasDocumentFace(record, face)))
                        return direction + (needed.length === 1 ? copyText('story.memorytask.2') : copyText('story.memorytask.3'));
                } else if (!this.state.records.includes(record)) return direction + copyText('story.memorytask.4');
            }
            return copyText('story.memorytask.5');
        }
        guidance(stage = 0, pose) {
            const s=this.state,area=game.ThreeExplorationMap.areaAt(pose,s.memory||'house',s)?.id;
            if(!s.memory && s.opened) {
                const has=id=>s.gear.includes(id);
                const nearby={
                    attic:has('paper')?copyText('story.guidance.attic'):s.basketDown?copyText('story.guidance.attic.2'):copyText('story.guidance.attic.3'),
                    cellar:has('coffinKey')?copyText('story.guidance.cellar'):s.sumpDrained?copyText('story.guidance.cellar.2'):s.filterClear?copyText('story.guidance.cellar.3'):copyText('story.guidance.cellar.4'),
                    workshop:!has('weight')?copyText('story.guidance.workshop'):!has('matches')?copyText('story.guidance.workshop.2'):!s.cellarOpen?(has('cellarKey')?copyText('story.guidance.workshop.3'):copyText('story.guidance.workshop.4')):null,
                    west_room:!s.wardrobeOpen?copyText('story.guidance.west_room'):!s.chestOpen?copyText('story.guidance.west_room.2'):!has('cellarKey')?copyText('story.guidance.west_room.3'):!has('paper')?copyText('story.guidance.west_room.4'):null
                };
                if(nearby[area]) return {text:nearby[area]};
            }
            if (this.arrivalTask()) return { text: this.arrivalTask() };
            if (this.state.memory) return this.memoryGuidance(stage);
            if (this.state.waterSolved && !this.state.photoFiled || this.state.courtyard && !this.state.calibrated) return { text: this.objective() };
            if (this.state.waterSolved) return { text: copyText('story.guidance.text') };
            if (this.state.courtyard) return this.waterGuidance(stage);
            if (this.state.opened) return { text: copyText('story.guidance.text.2') };
            if (this.state.lamp === 'out' || this.state.lamp === 'lit') return { text: this.objective() };
            const read = id => this.state.records.includes(id);
            if (stage <= 0) {
                let text;
                if (read('key_board') && !read('wall_marks')) text = copyText('story.guidance');
                else if (!read('letter')) text = copyText('story.guidance.2');
                else if (!read('lock')) text = copyText('story.guidance.3');
                else text = copyText('story.guidance.4');
                return { text, next: copyText('story.guidance.next') };
            }
            if (stage === 1) {
                const evidence = [];
                if (read('letter')) evidence.push(copyText('story.guidance.5'));
                if (!evidence.length) evidence.push(copyText('story.guidance.6'));
                return { text: evidence.join('\n\n') + copyText('story.guidance.text.3'), next: copyText('story.guidance.next.2') };
            }
            return { text: copyText('story.guidance.text.4') };
        }
        waterGuidance(stage) {
            if (stage <= 0) return { text: this.state.records.includes('kitchen_note')
                ? copyText('story.waterguidance.text')
                : copyText('story.waterguidance.text.2'), next: copyText('story.waterguidance.next') };
            if (stage === 1) return { text: copyText('story.waterguidance.text.3'), next: copyText('story.waterguidance.next.2') };
            return { text: copyText('story.waterguidance.text.4') };
        }
        memoryGuidance(stage) {
            const id = this.state.memory, definition = game.MEMORY_CASES[id];
            if (id === 'crash' && this.truthSolved()) return { text: copyText('story.memoryguidance.text') };
            if (this.state.deductions[id]) return { text: this.conclusionFor(id) + copyText('story.memoryguidance.text.2') };
            if (stage === 0) return { text: { school: copyText('story.memoryguidance.school'),
                hospital: copyText('story.memoryguidance.hospital'),
                crash: copyText('story.memoryguidance.crash') }[id], next: copyText('story.memoryguidance.next') };
            if (stage === 1) return { text: copyText('story.memoryguidance.text.3'), next: copyText('story.memoryguidance.next.2') };
            const titles = definition.records.map(record => game.WORLD_MAP.interactables.find(item => item.id === record).title);
            const sequence = definition.timelineOrder.map(event => { const fact = definition.facts.find(fact => fact.id === event); return `${fact.title}：${fact.quote}`; });
            return { text: copyText('story.memoryguidance.text.4', titles[0], titles[1], sequence.join('\n\n'), definition.choices[definition.answer]) };
        }
        save(position) {
            if (position) this.state.position = position;
            this.onProgress?.();
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
