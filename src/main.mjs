import { parseStoryCopy, applyStoryLabels } from './story-copy.mjs';
import { playDrive } from './drive-intro.mjs';
import * as THREE from '../vendor/three.module.mjs';
import { GLTFLoader } from '../vendor/GLTFLoader.mjs';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.mjs';
try {
    const response=await window.fetch('STORY.md',{cache:'no-cache'});
    if(!response.ok)throw new Error('STORY.md HTTP '+response.status);
    window.HuishaCopy=parseStoryCopy(await response.text());
    applyStoryLabels(document,window.HuishaCopy);
} catch(error) {
    document.getElementById('load-status').textContent='无法读取 STORY.md，请刷新页面，或使用 StartGame.bat 打开。';
    throw error;
}
const copyText=window.HuishaCopy;
const {equipment,household}=await import('./chapter-ui.mjs');
window.THREE = THREE;
window.Huisha3D = { GLTFLoader, mergeGeometries };
const sceneModules = ['ThreeHouseMap', 'ThreeCourtyardMap', 'ThreeMemoryMap', 'ThreeWestRoom', 'ThreeStoreys', 'ThreeClerk', 'ThreeExplorationMap', 'ThreeStory', 'ThreePreferences', 'ThreeSettings', 'ThreeControls', 'ThreeInteraction', 'ThreeWindowWall', 'ThreeKitchen', 'ThreeCourtyard', 'ThreePhone', 'ThreeDocument', 'ThreeMemoryScenes', 'ThreeMemoryTimeline', 'ThreeMemoryJournal', 'ThreeEvidenceJournal', 'ThreePortrait', 'ThreeDoorMechanism', 'ThreeVillageLane', 'ThreeHouseScene', 'ThreeAudio', 'ThreeWellChase'];
// Fetch in parallel. Registration still follows map, story, controls and scene order.
for (const name of sceneModules) {
    const link = document.createElement('link');
    link.rel = 'modulepreload'; link.href = `src/3d/${name}.js`;
    document.head.append(link);
}
for (const name of sceneModules) await import(`./3d/${name}.js`);
const $ = id => document.getElementById(id);
const game = window.Huisha3D;
const story = new game.ThreeStory();
// On a resume, request the carried object's photograph before the room starts streaming its models.
function preloadHeightStitch() {
    if ($('height-stitch-preload')) return;
    const link=document.createElement('link');
    link.id='height-stitch-preload'; link.rel='preload'; link.as='image';
    link.href='assets/art/height-stitch.jpg'; link.fetchPriority='high';
    document.head.append(link);
}
if (story.state.heightStripTaken) preloadHeightStitch();
const preferences = new game.ThreePreferences();
const settings = new game.ThreeSettings({ preferences, onChange: applyPreferences });
const reader = $('reader');
const audio = new game.ThreeAudio();
const assetErrors = new Set();
const evidenceJournal = new game.ThreeEvidenceJournal({ story, knownRecords, appendRecordAction(detail,record){
    const label={glass_impression:'mask.openSample',mask_photo:'mask.openPhoto'}[record.id];
    if(!label)return;
    const button=document.createElement('button');button.type='button';button.textContent=copyText(label);
    const back=()=>journal(!!scene?.inspectionReturn);
    button.onclick=()=>readRecord(record,[[copyText('main.readrecord'),back]]);
    detail.append(button);
} });
const explorationMap = new game.ThreeExplorationMap({ story, knownRecords, open, onRead: id => {
    const record = knownRecords().find(record => record.id === id);
    if (record) readRecord(record, [[copyText('main.explorationmap.onread'), () => showMap(false)]]);
} });
const memoryJournal = new game.ThreeMemoryJournal({ story, open, close, knownRecords,
    journal: () => journal(!!scene?.inspectionReturn), onReturn: returnMemory,
    onSolved: () => { audio.chime(); scene.syncState(); updateStatus(); } });
const inputGuide = copyText('main.inputguide');
let stopDrive, replayOnly = false, restoreMouse = false;
let mode = 'title', scene, lastFocus, saveTimer, portraitUiState, documentUiState;
const isPaused = () => mode !== 'game' || reader.open || document.hidden || scene?.watch?.phase==='film' || !!scene?.inspectionReturn;
function updateLoadStatus() {
    $('load-status').textContent = assetErrors.size
        ? copyText('main.updateloadstatus', [...assetErrors].join('、'))
        : story.saveAvailable ? copyText('main.updateloadstatus.2') : copyText('main.updateloadstatus.3');
}
function updateStatus() {
    $('objective').textContent = story.headline(scene?.controls ? scene.playerSnapshot() : undefined);
    $('shield-flame').hidden = story.state.lamp !== 'lit' || !!scene?.inspectionReturn;
    $('shield-flame').setAttribute('aria-pressed', String(story.state.shielded));
    $('shield-flame').textContent = story.state.shielded ? copyText('main.updatestatus') : copyText('main.updatestatus.2');
    $('begin').textContent = story.state.memory ? copyText('main.updatestatus.3', game.MEMORIES[story.state.memory].title)
        : story.state.records.length || story.state.position ? (story.state.courtyard ? copyText('main.updatestatus.4') : copyText('main.updatestatus.5')) : copyText('main.updatestatus.6');
    $('restart').hidden = !story.state.records.length && !story.state.position;
    $('replay-drive').hidden = story.state.arrival === 'intro';
    if (story.state.arrival !== 'home' && !story.state.memory) {
        $('chapter-number').textContent = copyText('main.updatestatus.7'); $('chapter-name').textContent = copyText('main.updatestatus.8');
        if (story.state.arrival !== 'intro') $('begin').textContent = copyText('main.updatestatus.9');
        return;
    }
    $('chapter-number').textContent = story.state.memory ? copyText('main.updatestatus.10') : story.state.courtyard ? copyText('main.updatestatus.11') : copyText('main.updatestatus.12');
    $('chapter-name').textContent = story.state.memory ? game.MEMORIES[story.state.memory].title : story.state.courtyard ? copyText('main.updatestatus.13') : copyText('main.updatestatus.14');
}
function save() {
    if (mode === 'game' && scene?.controls) story.save(scene.playerSnapshot());
    updateStatus();
}
function applyPreferences() {
    if (scene?.renderer) scene.renderer.toneMappingExposure = preferences.values.brightness;
    audio.setVolume(preferences.values.volume);
    audio.setMix(preferences.values.musicMix,preferences.values.rainMix);
    audio.setMuted(preferences.values.muted, mode === 'game' && !document.hidden);
    if (!preferences.values.pointerLock && document.pointerLockElement) document.exitPointerLock();
}
function titleSettings() {
    open(copyText('main.titlesettings'), copyText('main.titlesettings.2'), [[copyText('main.titlesettings.3'), close]], copyText('main.titlesettings.4'));
    settings.append($('reader-body'));
}
function releaseMouse() {
    if (document.pointerLockElement) {
        restoreMouse = true;
        document.exitPointerLock();
    }
}
function resumeWorld() {
    const canvas = scene?.renderer?.domElement;
    if (mode !== 'game' || reader.open || scene?.inspectionReturn || !canvas) return;
    canvas.focus({preventScroll:true});
    if (restoreMouse && preferences.values.pointerLock) {
        try { canvas.requestPointerLock?.()?.catch?.(() => {}); } catch (_) { /* dragging stays available */ }
    }
    restoreMouse = false;
}
function open(title, text, actions = [], eyebrow = copyText('main.open')) {
    if (!reader.open) {
        lastFocus = document.activeElement;
        if (mode === 'game' && scene?.controls) story.save(scene.playerSnapshot());
    }
    scene?.controls?.clear();
    touches.clear(); updateTouch();
    releaseMouse();
    $('reader-title').textContent = title;
    $('reader-eyebrow').textContent = eyebrow;
    const body = $('reader-body'); body.replaceChildren();
    if (text) { const p = document.createElement('p'); p.textContent = text; body.append(p); }
    $('reader-actions').replaceChildren();
    for (const [label, callback] of actions) {
        const button = document.createElement('button'); button.textContent = label;
        button.addEventListener('click', callback); $('reader-actions').append(button);
    }
    if (!reader.open) reader.showModal();
    if (noticeHost.parentNode!==reader) reader.append(noticeHost);
    $('reader-title').focus();
    reader.scrollTop = 0;
    updateStatus();
}
function close() {
    reader.close(); document.body.append(noticeHost); scene?.controls?.clear();
    if (mode === 'game' && !scene.inspectionReturn) resumeWorld();
    else if (lastFocus?.isConnected) lastFocus.focus?.({ preventScroll: true });
    save();
}
const noticeHost = $('acquisitions');
function progressSignature() {
    const entries = new Map(story.carried().map(id => ['item.'+id,'“'+equipment[id][0]+copyText('main.progresssignature')]));
    for(const id of story.state.records) {
        const title = id==='portrait_back' ? game.PORTRAIT_BACK_RECORD.title : game.WORLD_MAP.interactables.find(item=>item.id===id)?.title;
        if(!title) continue;
        const pages = story.state.documentViews[id] || (id==='crash_phone' ? story.state.phoneViews : []);
        entries.set('record.'+id+'.'+pages.length,copyText('main.progresssignature.2')+title+'”');
    }
    return entries;
}
let seenProgress=progressSignature();
story.onProgress=()=>{
    const current=progressSignature();
    if(mode==='game') for(const [key,message] of current) {
        if(seenProgress.has(key)) continue;
        const notice=document.createElement('div');notice.textContent=message;noticeHost.append(notice);
        audio.tone(key.startsWith('item.')?660:480,.13,.065);
        window.setTimeout(()=>notice.remove(),4200);
    }
    seenProgress=current;
};
function pocketLetter() {
    const item=game.WORLD_MAP.interactables.find(entry=>entry.id==='car_envelope');
    story.record(item.id);story.advanceArrival('letter','ledger');
    readRecord(item,[[copyText('main.pocketletter'),backpack],[copyText('main.pocketletter.2'),close]]);
}
function showBridgePhoto(){
    const record=game.WORLD_MAP.interactables.find(item=>item.id==='bend_photo');
    if(!story.state.records.includes(record.id)) {story.record(record.id);audio.paper();}
    readRecord(record,[[copyText('main.showbridgephoto'),close]]);
}
function inspectUniform(){
    const collar=game.WORLD_MAP.interactables.find(item=>item.id==='uniform_collar');
    if(!story.state.records.includes(collar.id)){story.record(collar.id);scene.syncState();audio.paper();}
    const found=story.state.records.includes('bend_photo');
    const text=found?copyText('housemap.uniform_collar.text',copyText('main.inspectuniform.2')):collar.text;
    const inspectCuff=()=>{
        const cuff=game.WORLD_MAP.interactables.find(item=>item.id==='uniform_cuff');
        story.record(cuff.id);
        readRecord(cuff,[[copyText('main.inspectuniform.3'),inspectUniform],[copyText('main.inspectuniform.4'),close]]);
    };
    readRecord({...collar,text},[...(!found?[[copyText('main.inspectuniform.5'),showBridgePhoto]]:[]),[copyText('main.inspectuniform.6'),inspectCuff],[copyText('main.inspectuniform.4'),close]]);
}
function lookAtHeightStrip() {
    const back = game.WORLD_MAP.interactables.find(item => item.id === 'height_stitch');
    open(copyText('housemap.height_stitch.location'), copyText('main.lookatheightstrip'), [
        [copyText('main.lookatheightstrip.2'), () => {
            story.record(back.id);
            readRecord(back, [[copyText('main.lookatheightstrip.3'), lookAtHeightStrip], [copyText('main.lookatheightstrip.4'), close]]);
        }], [copyText('main.pocketletter'), backpack], [copyText('main.lookatheightstrip.4'), close]
    ]);
}
function familyPacket(inBag=false){
    const s=story.state;
    const empty=s.familyLetterTaken && !inBag;
    const actions=[];
    const back=()=>familyPacket(inBag);
    const read=id=>{
        const item=game.WORLD_MAP.interactables.find(entry=>entry.id===id);
        if(!s.records.includes(id))story.record(id);
        audio.paper();
        const choices=[[copyText('family.fold'),back]];
        if (id === 'medicine_letter' && story.hasDocumentFace('school_postcard','front')) {
            choices.unshift([copyText('family.viewPostcard'), () => {
                open(copyText('postcard.title'), copyText('postcard.photo'), [[copyText('family.returnLetter'), () => read(id)]]);
                const image = document.createElement('img');
                image.className = 'record-photo';
                image.alt = copyText('postcard.photoTitle');
                image.src = 'assets/art/school-postcard.webp';
                $('reader-body').prepend(image);
            }]);
        }
        if(id==='family_stub' && s.records.includes('hospital_fare')){
            choices.unshift([copyText('family.compareAction'),()=>open(copyText('family.compareTitle'),copyText('family.compare'),[[copyText('family.fold'),back]])]);
        }
        readRecord(item,choices);
    };
    if(!empty){
        actions.push([copyText('family.read'),()=>read('medicine_letter')],[copyText('family.checkStub'),()=>read('family_stub')]);
    }
    if(inBag){
        actions.push([copyText('family.back'),backpack],[copyText('main.backpack.3'),close]);
    }else{
        actions.push([copyText(empty?'family.replace':'family.take'),()=>{
            s.familyLetterTaken=!empty;
            save();audio.paper();scene.courtyard.syncPacket(s);familyPacket();
        }],[copyText('main.inspect.37'),close],[copyText(s.stoveLit || s.gear.includes('matches')?'main.inspect.38':'main.inspect.39'),()=>ending('stay')]);
    }
    open(copyText(empty?'family.emptyTitle':'family.packet'),copyText(empty?'family.empty':inBag?'family.inBag':'family.outside'),actions);
}
function backpack() {
    const description=id=>{
        if (id==='rice' && story.state.porkOnRice) return copyText('main.backpack');
        if (id==='lunchbox' && story.state.riceStage==='served') return copyText('main.backpack.2');
        return equipment[id][1];
    };
    const choices=story.carried().map(id=>[equipment[id][0],id==='envelope'?pocketLetter:id==='uniform'?inspectUniform:id==='roadPhoto'?showBridgePhoto:
        id==='familyLetter'?()=>familyPacket(true):id==='heightStrip'?lookAtHeightStrip:()=>open(equipment[id][0],description(id),[[copyText('main.pocketletter'),backpack],[copyText('main.backpack.3'),close]],copyText('main.backpack.4'))]);
    open(copyText('main.backpack.5'),choices.length?'':copyText('main.backpack.6'),[...choices,[copyText('main.backpack.7'),close]],copyText('main.backpack.8'));
}
function knownRecords() {
    return story.state.records.map(id => id === 'portrait_back'
        ? game.PORTRAIT_BACK_RECORD
        : game.WORLD_MAP.interactables.find(item => item.id === id)).filter(Boolean).map(presentRecord);
}
function presentRecord(item) {
    if(item.id==='repair_order' && story.state.stripNoteLeft)return {...item,text:item.text+'\n\n'+copyText('workorder.note')};
    if(item.id==='duty_book' && story.state.keyAtBooth)return {...item,text:copyText('housemap.duty_book.text',copyText('clerk.keyLogged'))};
    if (item.id === 'duty_book' && story.carried().includes('key'))
        return {...item,text:copyText('housemap.duty_book.text',copyText('main.presentrecord.text.2'))};
    if (Object.hasOwn(game.DOCUMENTS, item.id)) return { ...item, text: story.documentText(item.id) };
    if (item.id === 'crash_phone') return { ...item, text: story.phoneText() };
    return item.id === 'yard_gate' && story.state.waterSolved ? { ...item,
        text: copyText('main.presentrecord.text.3') } : item;
}
function journal(backToLock = false) {
    open(copyText('main.journal'), '', [
        [backToLock ? inspectionLabel() : copyText('memoryjournal.show'), backToLock ? resumeInspection : close],
        [copyText('main.journal.2'), () => guidance(0, backToLock)]
    ], copyText('main.journal.3'));
    memoryJournal.appendLinks($('reader-body'));
    evidenceJournal.append($('reader-body'));
}
function recordPhoto(slug,caption) {
    const image=document.createElement('img');
    image.className='record-photo';image.alt=caption;
    image.width=900;image.height=600;image.fetchPriority='high';
    image.src='assets/art/'+slug+'.jpg';
    return image;
}
function readRecord(item, actions) {
    const choices = [...actions];
    if(['glass_impression','mask_photo'].includes(item.id) && ['glass_impression','mask_photo'].every(id=>story.state.records.includes(id))){
        choices.unshift([copyText('main.inspect.13'),()=>compareMask(false,()=>readRecord(item,actions))]);
    }
    if (!choices.some(([label]) => label === copyText('main.readrecord'))) choices.push([copyText('main.readrecord'), () => journal(!!scene?.inspectionReturn)]);
    open(item.title, item.text, choices);
    if(item.id==='well_grip')showGripPhoto(true);
    const photographs={letter:'family-new-year',wedding_photo:'silver-wedding',bend_photo:'bridge-bicycle',height_stitch:'height-stitch'};
    if(photographs[item.id]){
        $('reader-body').prepend(recordPhoto(photographs[item.id],item.title));
    }
    if(item.id==='glass_impression')$('reader-body').prepend(inkStudy());
    if(['paper_mask','mask_strap','mask_photo'].includes(item.id)){
        const image=document.createElement('img');
        image.className='mask-study';image.width=702;image.height=768;image.alt=item.title;
        image.src='assets/art/paper-mask-'+(item.id==='mask_strap'?'back':'front')+'.webp';
        $('reader-body').prepend(image);
    }
    evidenceJournal.appendPinAction($('reader-actions'), item.id);
}
function showMap(resetScope = true) {
    if (mode !== 'game') return;
    const pose = { ...scene.playerSnapshot() }; story.visitPosition(pose);
    explorationMap.show({ pose, resetScope, exitLabel: scene.inspectionReturn ? inspectionLabel() : copyText('main.showmap.exitlabel'),
        onExit: scene.inspectionReturn ? resumeInspection : close });
}
function album() {
    const item = game.WORLD_MAP.interactables.find(item => item.id === 'memory_album');
    const {photoFiled,records}=story.state;
    const text=photoFiled?copyText('main.album'):copyText('main.album.2');
    const actions=Object.entries(game.MEMORIES).map(([id,definition])=>{
        if(id==='crash' && !photoFiled && records.includes('bend_photo')) return [copyText('main.album.3'),()=>{
            story.state.photoFiled=true;story.save();audio.paper();album();
        }];
        return [id==='crash'&&!photoFiled?copyText('main.album.4'):copyText('main.album.5', definition.title),()=>enterMemory(id)];
    });
    open(item.title,text,[...actions,[copyText('main.album.6'),close]],copyText('main.album.7'));
    if(photoFiled){
        $('reader-body').prepend(recordPhoto('bridge-bicycle',copyText('main.album.8')));
    }
}
function enterMemory(id) {
    if(id==='crash' && !story.state.photoFiled){
        const note=story.state.records.includes('uniform_collar')?copyText('main.entermemory'):copyText('main.entermemory.2');
        open(copyText('main.entermemory.3'),note,[[copyText('main.entermemory.4'),album],[copyText('chapter-ui.household'),close]]);return;
    }
    leaveInspection(false);
    if (!story.enterMemory(id, scene.playerSnapshot())) return;
    scene.controls.teleport(story.state.position); scene.syncState(true); audio.resetPosition();
    if (reader.open) reader.close(); save(); resumeWorld();
}
function returnMemory() {
    leaveInspection(false);
    const pose = story.leaveMemory(); if (!pose) return;
    scene.controls.teleport(pose); scene.syncState(true); audio.resetPosition();
    if (reader.open) reader.close(); save(); resumeWorld();
}
function guidance(stage = 0, backToLock = !!scene?.inspectionReturn) {
    const hint = story.guidance(stage,scene.playerSnapshot());
    const actions = [[copyText('memoryjournal.show.2'), () => journal(backToLock)], [backToLock ? inspectionLabel() : copyText('memoryjournal.show'), backToLock ? resumeInspection : close]];
    if (hint.next) actions.push([hint.next, () => guidance(stage + 1, backToLock)]);
    open(copyText('main.guidance'), hint.text, actions, stage >= 2 ? copyText('main.guidance.2') : copyText('main.guidance.3'));
}
function inspectionLabel() { return { wellSeat: copyText('well.seat.back'), water: copyText('main.inspectionlabel.water'), portrait: copyText('main.inspectionlabel.portrait'), phone: copyText('main.inspectionlabel.phone'), document: copyText('main.inspectionlabel.document') }[scene.inspectionKind] || copyText('main.inspectionlabel'); }
function resumeInspection() { ({ wellSeat: sitAtDoorway, water, portrait, phone, lock, document: () => documentInspect(scene.documents.activeId) }[scene.inspectionKind] || lock)(); }
function updateObjectReading(kind, record, space) {
    const host = $(`${kind}-reading`), hadFocus = host.contains(document.activeElement);
    host.replaceChildren(); host.hidden = !record;
    if (record) {
        const detail = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p');
        summary.textContent = record.title; text.textContent = record.text; detail.append(summary, text); host.append(detail);
        const actions = document.createElement('div'); actions.className = 'inspection-reading-actions';
        const expand = document.createElement('button'); expand.type = 'button'; expand.dataset.readExpanded = kind; expand.textContent = copyText('main.updateobjectreading');
        expand.addEventListener('click', () => readRecord(record,
            [[inspectionLabel(), resumeInspection], [copyText('main.updateobjectreading.2'), () => memoryJournal.show(space)], [copyText('memoryjournal.show.3'), returnMemory]]));
        const reason = document.createElement('button'); reason.type = 'button'; reason.textContent = copyText('main.updateobjectreading.2'); reason.dataset.readDeduce = space;
        reason.addEventListener('click', () => memoryJournal.show(space));
        actions.append(expand, reason); evidenceJournal.appendPinAction(actions, record.id); host.append(actions);
    }
    if (hadFocus) (kind === 'document' ? $('document-flip') : document.querySelector(`[data-phone-page="${scene.phone.page}"]`))?.focus({ preventScroll: true });
}
function updateDocument() {
    const id = scene.documents.activeId; if (!id) return;
    const face = scene.documents.visibleFace, targetBack = Math.cos(scene.documents.angle) < 0;
    const loose=id==='school_draft' && !story.state.formJoined;
    const state = `${id}:${face}:${targetBack}:${loose}:${(story.state.documentViews[id] || []).join(',')}`;
    if (state === documentUiState) return; documentUiState = state;
    $('document-title').textContent = game.DOCUMENTS[id].title;
    $('document-join').hidden = !loose;
    $('document-read').hidden = loose;
    $('document-read').disabled = !face || loose;
    $('document-flip').textContent = targetBack ? copyText('main.updatedocument') : copyText('main.updatedocument.2');
    $('document-status').textContent = loose ? copyText('main.updatedocument.3') : face ? copyText('main.updatedocument.4', game.DOCUMENTS[id].faces[face].title, story.hasDocumentFace(id, face) ? copyText('main.updatedocument.5') : copyText('main.updatedocument.6'))
        : copyText('main.updatedocument.7');
    const definition = game.DOCUMENTS[id], page = face && definition.faces[face];
    updateObjectReading('document', page && story.hasDocumentFace(id, face)
        ? { id, title: `${definition.title} · ${page.title}`, text: page.text } : null, definition.space);
}
function documentInspect(id) {
    if (!Object.hasOwn(game.DOCUMENTS, id) || story.state.memory !== game.DOCUMENTS[id].space) return;
    if (reader.open) reader.close(); releaseMouse();
    touches.clear(); updateTouch(); scene.beginDocumentInspection(id);
    $('document-inspector').hidden = false; $('hud').classList.add('inspecting'); documentUiState = null; updateDocument();
    (!$('document-join').hidden ? $('document-join') : $('document-read').disabled ? $('document-flip') : $('document-read')).focus();
}
function updatePhone() {
    const page = scene.phone.page;
    document.querySelectorAll('[data-phone-page]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.phonePage === page)));
    $('phone-read').disabled = !Object.hasOwn(game.PHONE_PAGES, page);
    $('phone-status').textContent = page === 'home' ? copyText('main.updatephone')
        : copyText('main.updatephone.2', game.PHONE_PAGES[page].title, story.state.phoneViews.includes(page) ? copyText('main.updatephone.3') : copyText('main.updatephone.4'));
    updateObjectReading('phone', story.state.phoneViews.includes(page)
        ? { id: 'crash_phone', title: copyText('main.crash_phone.title', game.PHONE_PAGES[page].title), text: game.PHONE_PAGES[page].text } : null, 'crash');
}
function phone() {
    if (story.state.memory !== 'crash') return;
    if (reader.open) reader.close(); releaseMouse();
    touches.clear(); updateTouch(); scene.beginPhoneInspection();
    $('phone-inspector').hidden = false; $('hud').classList.add('inspecting'); updatePhone();
    document.querySelector('[data-phone-page]').focus();
}
function phonePage(page) {
    if (reader.open || scene.inspectionKind !== 'phone' || !scene.phone.selectPage(page)) return;
    updatePhone();
}
function updatePortrait(message) {
    const uncovered = story.state.portrait, back = scene.portrait.backVisible, targetBack = Math.cos(scene.portrait.angle) < 0;
    const state = `${uncovered}:${back}:${targetBack}:${story.state.portraitBackRead}`;
    if (message) $('portrait-status').textContent = message;
    if (portraitUiState === state) return;
    portraitUiState = state;
    $('portrait-reveal').hidden = uncovered; $('portrait-flip').disabled = !uncovered; $('portrait-read').disabled = !back;
    $('portrait-flip').textContent = targetBack ? copyText('main.updatedocument') : copyText('main.updatedocument.2');
    if (!message) $('portrait-status').textContent = !uncovered ? copyText('main.updateportrait')
        : back ? copyText('main.updateportrait.2') : copyText('main.updateportrait.3');
}
function portrait() {
    if (reader.open) reader.close(); releaseMouse();
    touches.clear(); updateTouch(); scene.beginPortraitInspection();
    $('portrait-inspector').hidden = false; $('hud').classList.add('inspecting'); portraitUiState = null; updatePortrait();
    (story.state.portrait ? $('portrait-flip') : $('portrait-reveal')).focus();
}
function updateLock(message) {
    $('lock-hang').hidden = story.state.lamp !== 'lit';
    if (message) $('lock-status').textContent = message;
    document.querySelectorAll('[data-wheel]').forEach((button, index) => {
        const symbol = game.ThreeStory.symbols[story.state.wheels[index]];
        button.querySelector('small').textContent = copyText('main.updatelock', symbol);
        button.setAttribute('aria-label', copyText('main.updatelock.2', [copyText('main.updatelock.3'), copyText('main.updatelock.4'), copyText('main.updatelock.5')][index], symbol));
    });
}
function leaveInspection(restoreFocus = true) {
    if (!scene?.inspectionReturn) return;
    $('well-seat').hidden=true;
    scene.endInspection(); $('lock-inspector').hidden = true; $('water-inspector').hidden = true; $('portrait-inspector').hidden = true; $('phone-inspector').hidden = true; $('document-inspector').hidden = true; $('hud').classList.remove('inspecting');
    for (const kind of ['phone', 'document']) { $(`${kind}-reading`).replaceChildren(); $(`${kind}-reading`).hidden = true; }
    touches.clear(); updateTouch();
    if (restoreFocus) resumeWorld();
    save();
}
function rotateLock(index) {
    if (scene.inspectionKind !== 'lock' || reader.open) return;
    story.rotate(index); audio.latch(); scene.syncState(); updateLock();
}
function lock() {
    if (story.state.opened) { open(copyText('main.lock'), copyText('main.lock.2'), [[copyText('main.lock.3'), close]]); return; }
    if (reader.open) reader.close();
    releaseMouse();
    touches.clear(); updateTouch(); scene.beginLockInspection();
    $('lock-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateStatus();
    updateLock(story.state.lamp === 'lit' ? copyText('main.lock.4') : copyText('main.lock.5'));
    evidenceJournal.sync();
    document.querySelector('[data-wheel]').focus();
}
function updateWater(message) {
    const [small, large] = story.state.buckets;
    $('level-small').textContent=small+copyText('main.updatewater'); $('level-large').textContent=large+copyText('main.updatewater.2');
    $('water-pour').textContent=scene.courtyard.selected?copyText('main.updatewater.3'):copyText('main.updatewater.4');
    if (message) $('water-status').textContent = message;
    document.querySelectorAll('[data-bucket]').forEach(button => {
        button.setAttribute('aria-pressed', String(Number(button.dataset.bucket) === scene.courtyard.selected));
        button.disabled = story.state.waterSolved || !!scene.courtyard.weighing;
    });
    for (const id of ['water-fill', 'water-empty', 'water-pour', 'water-weigh']) $(id).disabled = story.state.waterSolved || !!scene.courtyard.weighing;
    scene.syncState(); updateStatus();
}
function water() {
    if (reader.open) reader.close();
    releaseMouse();
    touches.clear(); updateTouch(); scene.beginWaterInspection();
    $('water-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateWater(story.state.waterSolved ? copyText('main.water')
        : copyText('main.water.2'));
    evidenceJournal.sync();
    (story.state.waterSolved ? $('water-leave') : document.querySelector('[data-bucket]')).focus();
}
function waterAction(action) {
    if (reader.open || scene.inspectionKind !== 'water' || story.state.waterSolved || scene.courtyard.weighing) return;
    if (/^bucket[01]$/.test(action)) {
        scene.courtyard.selected = Number(action.slice(-1));
        updateWater(copyText('main.wateraction', scene.courtyard.selected ? copyText('main.wateraction.2') : copyText('main.wateraction.3'))); return;
    }
    const index = scene.courtyard.selected;
    let changed = false, message;
    if (action === 'fill') { changed = story.fillBucket(index); message = changed ? copyText('main.wateraction.4') : copyText('main.wateraction.5'); }
    else if (action === 'empty') { changed = story.emptyBucket(index); message = changed ? copyText('main.wateraction.6') : copyText('main.wateraction.7'); }
    else if (action === 'pour') { const amount = story.pourBucket(index); changed = amount > 0; message = amount ? copyText('main.wateraction.8', amount) : copyText('main.wateraction.9'); }
    else if (action === 'weigh') {
        if (scene.courtyard.beginWeigh() && scene.courtyard.weighing) updateWater(copyText('main.wateraction.10'));
        return;
    } else return;
    if (changed) audio.water(action);
    updateWater(message);
}
function busEnding() {
    const {records,heightStripTaken} = story.state;
    const readLetter=records.includes('medicine_letter');
    const departureText=story.state.familyLetterTaken
        ? (readLetter?'family.busRead':'family.busCarried')
        : (readLetter?'main.busending':'main.busending.2');
    const paragraphs=[copyText(departureText)];
    if (heightStripTaken) paragraphs.push(records.includes('height_stitch')
        ? copyText('main.busending.3')
        : copyText('main.busending.4'));
    paragraphs.push(copyText('bus.collectCar'));
    const hasKey=story.carried().includes('key');
    if(records.includes('clerk_contact'))paragraphs.push(copyText(hasKey?'main.busending.5':'clerk.busThanks'));
    else if(hasKey)paragraphs.push(copyText('workorder.bringKey'));
    if(story.state.stripNoteLeft && !heightStripTaken)paragraphs.push(copyText('workorder.bus'));
    return [...paragraphs,copyText('main.busending.6')].join('\n\n');
}
function ending(choice, memoryPlace) {
    if (!story.depart(choice,memoryPlace)) return;
    audio.chime();
    const text = choice === 'wake'
        ? copyText('main.ending')
        : choice === 'remember'
        ? copyText('main.ending.2')
        : choice === 'stay'
        ? (story.state.stoveLit ? copyText('main.ending.3') : copyText('main.ending.4'))+'\n\n'+(story.state.leakMuffled?copyText('main.ending.5'):copyText('main.ending.6'))+copyText('main.ending.7')
        : busEnding();
    let endingText=text;
    if(choice==='stay' && story.state.records.includes('clerk_holdall') && story.state.records.includes('clerk_cuff')) {
        const supper = story.state.stoveLit
            ? copyText('main.ending.8')
            : copyText('main.ending.9');
        const lastButton = story.state.stoveLit
            ? copyText('main.ending.10')
            : copyText('main.ending.11');
        endingText=supper+copyText('main.ending.12')+lastButton+copyText('main.ending.7');
    }
    if(choice==='remember' && story.state.rememberPlace==='bridge') {
        endingText=copyText('main.ending.13');
    }
    open({ stay: copyText('main.ending.stay'), leave: copyText('courtyardmap.bus_notice.location'), wake: copyText('main.ending.wake'), remember: copyText('main.ending.remember') }[choice], endingText, [[copyText('main.ending.14'), close], [copyText('main.titlesettings.3'), title]], copyText('main.ending.15'));
}
function inspectWorkOrder(){
    const item=game.WORLD_MAP.interactables.find(entry=>entry.id==='repair_order');
    const s=story.state,actions=[];
    if(!s.records.includes(item.id))story.record(item.id);
    if(s.stripNoteLeft || (s.records.includes('wall_marks') && !s.heightStripTaken)){
        actions.push([copyText(s.stripNoteLeft?'workorder.remove':'workorder.add'),()=>{
            s.stripNoteLeft=!s.stripNoteLeft;
            story.save();audio.paper();inspectWorkOrder();
        }]);
    }
    actions.push([copyText('chapter-ui.household'),close]);
    readRecord(presentRecord(item),actions);
}
function inspectVillage(item) {
    const phase = story.state.arrival;
    if (item.id === 'clerk') {
        const after=phase==='letter'?copyText('main.inspectvillage'):
            phase==='ledger'?copyText(story.state.clerkKnowsAddress?'main.inspectvillage.2':'clerk.noAddress'):
            phase==='keys'?copyText('main.inspectvillage.3'):
            phase==='gate'?copyText('main.inspectvillage.4'):
            copyText('main.inspectvillage.5');
        const returnToClerk=()=>inspectVillage(item);
        const leave=[copyText('main.inspectvillage.11'),close];
        const showLetter=[copyText(phase==='letter'?'main.inspectvillage.17':'clerk.showLetter'),()=>{
            story.state.clerkKnowsAddress=true;
            story.advanceArrival('letter','ledger');story.save();audio.paper();
            open(item.title,copyText('clerk.envelopeShown'),[[copyText('clerk.toWindow'),returnToClerk],leave]);
        }];
        const readSlip=()=>{
            const read=(id,choices)=>{
                const page=game.WORLD_MAP.interactables.find(entry=>entry.id===id);
                story.record(id);readRecord(page,choices);
            };
            const giveBack=[copyText('main.inspectvillage.10'),returnToClerk];
            const back=[copyText('post.backToSlip'),readSlip];
            const choices=[[copyText('post.compare'),()=>read('forwarding_slip',[back,giveBack,leave])]];
            if(!story.state.records.includes('clerk_contact')){
                choices.push([copyText('post.saveContact'),()=>read('clerk_contact',[back,giveBack,leave])]);
            }
            read('post_counterfoil',[...choices,giveBack,leave]);
        };
        const seenSlip=story.state.records.some(id=>id==='post_counterfoil'||id==='forwarding_slip');
        const askAboutPost=story.state.clerkExplainedPost?[copyText(seenSlip?'clerk.readSlip':'main.inspectvillage.9'),readSlip]:
            [copyText('main.inspectvillage.6'),()=>{
                story.state.clerkExplainedPost=true;story.save();
                open(copyText('main.inspectvillage.7'),copyText('main.inspectvillage.8'),[
                    [copyText('main.inspectvillage.9'),readSlip],[copyText('main.inspectvillage.12'),close]]);
            }];
        const discuss=(id)=>{
            const account=game.WORLD_MAP.interactables.find(entry=>entry.id===id);
            story.record(id);
            readRecord(account,[[copyText('main.inspectvillage.13'),()=>inspectVillage(item)],[copyText('main.inspectvillage.11'),close]]);
        };
        const driverAnswered=story.state.records.includes('bridge_driver');
        const askRoad=[copyText(driverAnswered?'clerk.bridgeReported':'clerk.askRoad'),()=>{
            const back=[copyText('main.inspectvillage.13'),returnToClerk];
            if(driverAnswered){
                open(item.title,copyText(story.state.records.includes('bridge_call')?'clerk.bridgeReplyAfterCall':'clerk.bridgeReply'),[back,leave]);
                return;
            }
            const answer=copyText(story.state.askedAboutRoad?'clerk.repeatRoad':'clerk.road');
            if(!story.state.askedAboutRoad){story.state.askedAboutRoad=true;story.save();}
            const called=story.state.records.includes('bridge_call');
            const followUp=()=>{
                if(story.state.busCalled || called){
                    open(item.title,copyText(story.state.busCalled?'clerk.bridgeArrived':'clerk.bridgePending'),[back,leave]);
                }else discuss('bridge_call');
            };
            open(item.title,answer,[[copyText(called?'clerk.bridgeFollowUp':'clerk.checkBridge'),followUp],back,leave]);
        }];
        const questions=[];
        if(phase==='letter' || (phase==='ledger' && !story.state.clerkKnowsAddress)){
            questions.push(showLetter,[copyText('clerk.sayAddress'),()=>{
                story.state.clerkKnowsAddress=true;
                story.advanceArrival('letter','ledger');story.save();
                returnToClerk();
            }]);
        }
        if(phase==='keys')questions.push([copyText('main.inspectvillage.14'),()=>inspectVillage(game.WORLD_MAP.interactables.find(entry=>entry.id==='key_board'))]);
        if(phase!=='letter'){
            questions.push([copyText('main.inspectvillage.18'),()=>{
                const book=game.WORLD_MAP.interactables.find(entry=>entry.id==='duty_book');
                story.record(book.id);inspectVillage(book);
            }],askAboutPost);
        }
        if(phase==='home' && story.state.records.includes('key_board')){
            const returned=story.state.keyAtBooth;
            questions.push([copyText(returned?'clerk.borrowKey':'clerk.returnKey'),()=>{
                story.state.keyAtBooth=!returned;story.save();scene.syncState();audio.latch();updateStatus();
                open(item.title,copyText(returned?'clerk.borrowed':'clerk.returned'),[[copyText('main.inspectvillage.13'),returnToClerk],leave]);
            }]);
        }
        questions.push(askRoad,[copyText('workorder.read'),inspectWorkOrder]);
        if(story.state.records.includes('car_envelope') && story.state.clerkExplainedPost){
            questions.push([copyText('post.askOldKey'),()=>discuss('clerk_old_key')]);
        }
        if(story.state.records.includes('wardrobe') && !story.state.wardrobeOpen)questions.push([copyText('clerk.workshop.ask'),()=>{
            open(item.title,copyText('clerk.workshop.answer'),[[copyText('main.inspectvillage.13'),returnToClerk],leave]);
        }]);
        if(story.state.coffinOpen || story.state.records.includes('coffin'))questions.push([copyText('main.inspectvillage.15'),()=>discuss('clerk_holdall')]);
        if(story.state.records.includes('uniform_cuff'))questions.push([copyText('main.inspectvillage.16'),()=>discuss('clerk_cuff')]);
        open(item.title,after,[...questions,leave]);return true;
    }
    if (item.id === 'car_envelope') {pocketLetter();return true;}
    else if (item.id === 'duty_book') {
        if(phase==='letter' || phase==='ledger')story.advanceArrival(phase,'keys');
        const actions = [[copyText('chapter-ui.household'),close]];
        if (story.state.arrival === 'keys') actions.unshift([copyText('main.inspectvillage.14'),()=>inspectVillage(game.WORLD_MAP.interactables.find(entry=>entry.id==='key_board'))]);
        readRecord(presentRecord(item),actions); return true;
    }
    else if(item.id==='key_board' && story.state.keyAtBooth){
        open(item.title,copyText('clerk.onHook'),[[copyText('clerk.talk'),()=>inspectVillage(game.WORLD_MAP.interactables.find(entry=>entry.id==='clerk'))],[copyText('chapter-ui.household'),close]]);return true;
    }
    else if (item.id === 'key_board' && story.carried().includes('key')) {
        open(item.title,copyText('main.inspectvillage.19'),[[copyText('chapter-ui.household'),close]]); return true;
    }
    else if (item.id === 'key_board' && phase === 'keys') {
        const choose = number => {
            if (number === 6) {
                story.record('key_board'); story.advanceArrival('keys','gate'); scene.syncState(); audio.latch();
                open(copyText('main.inspectvillage.20'), copyText('main.inspectvillage.21'), [[copyText('main.inspectvillage.22'), close]]);
            } else {
                open(copyText('main.inspectvillage.23'), copyText('main.inspectvillage.24'), [[copyText('main.inspectvillage.25'),()=>inspectVillage(game.WORLD_MAP.interactables.find(entry=>entry.id==='duty_book'))],[copyText('main.inspectvillage.26'), () => inspectVillage(item)], [copyText('main.inspectvillage.11'), close]]);
            }
        };
        open(item.title, item.text + copyText('main.inspectvillage.27'), [9,6,16].map(n => [copyText('main.inspectvillage.28', n), () => choose(n)]));
        return true;
    } else if (item.id === 'front_gate' && phase === 'gate') {
        open(item.title, item.text + copyText('main.inspectvillage.29'), [[copyText('main.inspectvillage.30'), () => {
            story.advanceArrival('gate','home'); audio.latch(); close();
        }], [copyText('main.inspectvillage.31'), close]]);
        return true;
    } else if (!['key_board','front_gate'].includes(item.id)) return false;
    const note = item.id==='front_gate' ? (phase==='home'?copyText('main.inspectvillage.32'):copyText('main.inspectvillage.33')) : '';
    readRecord({...item, text: item.text + '\n\n' + note}, [[copyText('chapter-ui.household'), close]]);
    return true;
}
function showGripPhoto(inside){
    const photo=document.createElement('div');
    photo.className='well-grip-photo';photo.dataset.inside=String(inside);
    photo.setAttribute('role','img');
    photo.setAttribute('aria-label',copyText(inside?'well.grip.photoInside':'well.grip.photoOutside'));
    $('reader-body').prepend(photo);
}
function sitAtDoorway(){
    if(reader.open)reader.close();
    releaseMouse();touches.clear();updateTouch();scene.sitAtWellDoorway();
    $('hud').classList.add('inspecting');$('well-seat').hidden=false;
    $('well-seat-view').textContent=copyText(story.state.bucketParked?'well.seat.quiet':'well.seat.view');
    $('well-seat-remember').textContent=copyText('well.seat.remember');
    $('well-seat-remember').setAttribute('aria-expanded','false');
    $('well-seat-remember').hidden=!story.state.records.includes('well_grip');
    $('well-seat-leave').focus();
}
$('well-seat-leave').addEventListener('click',()=>leaveInspection());
$('well-seat-remember').addEventListener('click',()=>{
    if(scene.inspectionKind!=='wellSeat' || !story.state.records.includes('well_grip'))return;
    const button=$('well-seat-remember');
    const remembering=button.getAttribute('aria-expanded')!=='true';
    if(remembering)story.record('well_seat_memory');
    button.setAttribute('aria-expanded',String(remembering));
    button.textContent=copyText(remembering?'well.seat.look':'well.seat.remember');
    $('well-seat-view').textContent=copyText(remembering?'well.seat.memory':story.state.bucketParked?'well.seat.quiet':'well.seat.view');
    updateStatus();
});
function inkStudy(){
    const page=document.createElement('div');page.className='ink-paper';
    const ink=document.createElement('img');ink.src='assets/art/cheek-impression.svg';ink.alt=copyText('mask.sampleAlt');
    page.append(ink);return page;
}
function compareMask(atDoor,back,side){
    const records=story.state.records;
    if(!records.includes('glass_impression') || !records.includes(atDoor?'paper_mask':'mask_photo'))return;
    const title=copyText('courtyardmap.mask_transfer.title');
    if(side==='right' && !records.includes('mask_transfer')){story.record('mask_transfer');audio.paper();}
    open(title,copyText(side==='right'?'mask.rightMatch':side==='left'?'mask.leftOnly':atDoor?'mask.compareHere':'mask.comparePhoto'),[
        [copyText('mask.left'),()=>compareMask(atDoor,back,'left')],
        [copyText('mask.right'),()=>compareMask(atDoor,back,'right')],
        [copyText('chapter-ui.household'),back]
    ]);
    const study=document.createElement('div');study.className='mask-comparison';
    const face=document.createElement('div');face.className='mask-reference';
    const image=document.createElement('img');image.src='assets/art/paper-mask-front.webp';image.alt=copyText('mask.faceAlt');
    face.append(image);
    const [left,right]=$('reader-actions').querySelectorAll('button');
    left.setAttribute('aria-pressed',String(side==='left'));right.setAttribute('aria-pressed',String(side==='right'));
    face.addEventListener('click',event=>{
        const bounds=face.getBoundingClientRect();
        (event.clientX<bounds.left+bounds.width/2?left:right).click();
    });
    if(side)face.dataset.cheek=side;
    for(const [visual,caption] of [[face,atDoor?'courtyardmap.paper_mask.title':'mask.photoTitle'],[inkStudy(),'mask.sampleTitle']]){
        const figure=document.createElement('figure'),label=document.createElement('figcaption');
        label.textContent=copyText(caption);figure.append(visual,label);study.append(figure);
    }
    $('reader-body').prepend(study);
}
function inspectWellGrip(item,firstLook=false){
    const s=story.state,known=s.records.includes(item.id);
    const actions=[];
    actions.push([s.wellGripOpen?copyText('well.grip.tuck'):copyText('well.grip.turn'),()=>{
        s.wellGripOpen=!s.wellGripOpen;
        if(!known)story.record(item.id);else story.save();
        scene.syncState();audio.paper();inspectWellGrip(item,!known);
    }]);
    if(s.wellEscaped && !s.bucketParked)actions.push([copyText('well.grip.park'),()=>{
        s.bucketParked=true;story.save();audio.latch();close();
    }]);
    actions.push([copyText('chapter-ui.household'),close]);
    const bucket=s.bucketParked ? copyText('well.grip.parked') : s.wellEscaped ? copyText('well.grip.loose') : '';
    let description=copyText('well.grip.inspect');
    if(known)description=s.wellGripOpen?copyText('well.grip.photoInside'):copyText('well.grip.tucked');
    open(known?item.title:copyText('well.grip.closed'),[firstLook?item.text:description,bucket].filter(Boolean).join('\n\n'),actions);
    showGripPhoto(s.wellGripOpen);
}
function inspect(item) {
    if(item.id==='repair_order'){inspectWorkOrder();return;}
    if(story.toggleDoor(item.id)){
        audio.swingDoor(story.state.closedDoors.includes(item.id));
        save();return;
    }
    item = presentRecord(item);
    ['lock', 'water_station'].includes(item.id) ? audio.knock() : audio.paper();
    if (['car_envelope','clerk','duty_book','key_board','front_gate'].includes(item.id) && inspectVillage(item)) return;
    if (household({story,scene,open,close,audio,inspectUniform},item)) return;
    if(item.id==='well_grip' || item.id==='yard_well' || item.id==='well_seat'){
        if(scene.watch?.phase==='chase'){
            open(item.title,copyText('main.inspect'),[[copyText('main.inspect.2'),close]]);return;
        }
    }
    if(item.id==='well_seat'){
        open(item.title,item.text,[[copyText('well.seat.sit'),sitAtDoorway],[copyText('chapter-ui.household'),close]]);
        return;
    }
    if(item.id==='well_grip'){inspectWellGrip(item);return;}
    if(item.id==='yard_well'){
        const investigate=()=>{close();scene.watch.begin();};
        const s=story.state;
        const text=s.bucketParked?copyText('well.grip.parked'):s.wellRopeFreed?copyText('well.grip.after'):item.text;
        const pull=s.wellEscaped?copyText('well.grip.replay'):s.wellRopeFreed?copyText('main.inspect.3'):copyText('main.inspect.4');
        readRecord({...item,text},[[pull,investigate],[copyText('main.inspect.5'),close]]);return;
    }
    if (item.id === 'wall_marks') {
        const taken = story.state.heightStripTaken;
        const move = () => {
            story.state.heightStripTaken = !taken;
            if (!taken) preloadHeightStitch();
            audio.paper(); scene.syncState(); close();
        };
        if (taken) open(copyText('interaction.showprompt.3'), copyText('main.inspect.6'), [
            [copyText('main.inspect.7'), move], [copyText('main.inspect.8'), close]
        ]);
        else readRecord(story.state.leakMuffled ? item : {...item,text:item.text+copyText('main.inspect.text')}, [[copyText('main.inspect.9'), move], [copyText('main.inspect.10'), close]]);
        return;
    }
    if(item.id==='paper_mask' || item.id==='wiper_print'){
        const records=story.state.records;
        const show=(id,actions)=>{
            story.record(id);audio.paper();
            readRecord(game.WORLD_MAP.interactables.find(entry=>entry.id===id),actions);
        };
        const leave=[copyText('chapter-ui.household'),close], actions=[];
        if(item.id==='paper_mask'){
            const flip=()=>{
                const hang=()=>{
                    story.state.maskHung=true;scene.courtyard.syncMask();close();
                };
                show('mask_strap',[[copyText('main.lookatheightstrip.3'),()=>inspect(item)],...(!story.state.maskHung?[[copyText('main.inspect.11'),hang]]:[]),leave]);
            };
            actions.push([copyText('main.inspect.12'),flip]);
            const photographed=records.includes('mask_photo');
            actions.push([copyText(photographed?'mask.openPhoto':'mask.photoAction'),()=>show('mask_photo',[[copyText('main.inspect.14'),()=>inspect(item)],leave])]);
            if(records.includes('glass_impression'))actions.unshift([copyText('main.inspect.13'),()=>compareMask(true,()=>inspect(item))]);
        }else{
            const sampled=records.includes('glass_impression');
            if(sampled)item={...item,text:copyText('mask.glassAfter')};
            actions.push([copyText(sampled?'mask.openSample':'mask.sampleAction'),()=>{
                show('glass_impression',[[copyText('main.inspect.14'),()=>inspect(item)],leave]);
            }]);
        }
        readRecord(item,[...actions,leave]);return;
    }
    if (item.id === 'lock') { lock(); return; }
    if (item.id === 'water_station') {
        if(!story.state.calibrated){
            const has=story.carried().includes('weight');
            open(copyText('main.inspect.15'),has?copyText('main.inspect.16'):copyText('main.inspect.17'),
                has?[[copyText('main.inspect.18'),()=>{story.state.calibrated=true;story.save();audio.latch();water();}],[copyText('chapter-ui.household'),close]]:[[copyText('chapter-ui.household'),close]]);
        }else water();
        return;
    }
    if (item.id === 'memory_album') { album(); return; }
    if (item.id === 'hospital_fare') {
        if (!story.state.fareTinOpen) {
            story.state.fareTinOpen = true;
            audio.latch();
            save();
            return;
        }
        story.record(item.id);
    }
    if (item.id === 'crash_phone') { phone(); return; }
    if (Object.hasOwn(game.DOCUMENTS, item.id)) { documentInspect(item.id); return; }
    if (item.returnMemory) { open(item.title, item.text, [[copyText('memoryjournal.show'), close], [copyText('memoryjournal.show.3'), returnMemory]]); return; }
    if (item.finalChoice) {
        const bridge=story.state.records.includes('bridge_post');
        const leave=[copyText('main.inspect.19'),close];
        const roadside=()=>{
            const touch=story.state.records.includes('crash_belt')?copyText('main.inspect.20'):copyText('main.inspect.21');
            open(copyText('main.inspect.22'),touch+'\n\n'+copyText('main.inspect.23'),[
                [copyText('main.inspect.24'),()=>ending('wake')],[copyText('main.inspect.25'),()=>home(bridge)],leave]);
        };
        const home=onBridge=>open(onBridge?copyText('main.inspect.26'):copyText('main.inspect.27'),onBridge
            ? copyText('main.inspect.28')
            : copyText('main.inspect.29'),
            [[onBridge?copyText('main.inspect.30'):copyText('main.inspect.31'),()=>ending('remember',onBridge?'bridge':'kitchen')],
                ...(bridge?[[onBridge?copyText('main.inspect.32'):copyText('main.inspect.33'),()=>home(!onBridge)]]:[]),[copyText('main.inspect.34'),roadside],leave]);
        open(item.title,item.text,[[copyText('main.inspect.35'),roadside],[copyText('main.inspect.36'),()=>home(bridge)],leave]);return;
    }
    if (item.deduction) {
        const actions=[[copyText('memoryjournal.show'),close],[copyText('main.updateobjectreading.2'),()=>memoryJournal.show(item.deduction)],[copyText('memoryjournal.show.3'),returnMemory]];
        if(item.id==='hospital_fare' && story.state.records.includes('family_stub')){
            actions.unshift([copyText('family.recallAction'),()=>open(copyText('family.compareTitle'),copyText('family.recall'),[[copyText('family.toTin'),()=>inspect(item)]])]);
        }
        readRecord(item,actions);return;
    }
    if (item.id === 'medicine_letter') {
        familyPacket();return;
    }
    if (item.id === 'stop_signal') {
        if (story.state.busCalled) {open(item.title, copyText('main.inspect.40'), [[copyText('chapter-ui.household'),close]]); return;}
        const turn = direction => {
            if (story.signalBus(direction)) {
                scene.syncState(); audio.latch(); open(copyText('main.inspect.41'), copyText('main.inspect.42'), [[copyText('main.inspect.43'),close]]);
            } else open(copyText('main.inspect.44'), copyText('main.inspect.45'), [[copyText('main.inspect.46'),()=>inspect(item)],[copyText('chapter-ui.household'),close]]);
        };
        open(item.title,item.text,[[copyText('main.inspect.47'),()=>turn('house')],[copyText('main.inspect.48'),()=>turn('bridge')],[copyText('chapter-ui.household'),close]]); return;
    }
    if (item.id === 'road_exit') {
        if (!story.state.busCalled) {
            open(item.title,copyText('main.inspect.50'),[[copyText('main.inspect.53'),close]]);
            return;
        }
        const askDriver=()=>{
            const account=game.WORLD_MAP.interactables.find(entry=>entry.id==='bridge_driver');
            const opening=copyText(story.state.records.includes('bridge_call')?'bus.bridgeAsked':'bus.bridgeDirect');
            story.record(account.id);
            readRecord({...account,text:opening+'\n\n'+account.text},[[copyText('bus.backToDoor'),()=>inspect(item)],[copyText('main.inspect.51'),close]]);
        };
        open(item.title,copyText('main.inspect.49'),[[copyText('bus.bridgeAsk'),askDriver],[copyText('main.inspect.52'),()=>ending('leave')],[copyText('main.inspect.51'),close]]);
        return;
    }
    if (item.id === 'portrait') { portrait(); return; }
    if (item.id === 'altar' && !story.state.opened && story.state.lamp !== 'lit') {
        const take = story.state.lamp === 'out' ? copyText('main.inspect.54') : copyText('main.inspect.55');
        readRecord(item, [[take, () => { if (story.takeLamp()) audio.latch(); close(); }], [copyText('main.inspect.56'), close]]);
        return;
    }
    if (item.id === 'threshold') {
        open(item.title, item.text, [[copyText('main.inspect.51'), close], [copyText('main.inspect.57'), () => {
            if (!story.finish()) return;
            close();
        }]]);
        return;
    }
    readRecord(item, [[copyText('memoryjournal.show'), close], [copyText('main.readrecord'), () => journal()]]);
}
function title() {
    leaveInspection(false);
    save(); if (reader.open) reader.close();
    scene.controls.clear(); releaseMouse();
    restoreMouse = false;
    mode = 'title'; $('hud').hidden = true; $('title-screen').hidden = false;
    audio.pause(); updateStatus(); $('begin').focus();
}
function pause() {
    open(copyText('main.pause'), story.headline() + '\n\n' + inputGuide, [
        [copyText('main.showmap.exitlabel'), close], [copyText('memoryjournal.show.2'), () => journal(!!scene.inspectionReturn)], [copyText('main.pause.2'), () => showMap()],
        ...(story.state.memory ? [[copyText('memoryjournal.show.3'), returnMemory]] : []), [copyText('main.titlesettings.3'), title]
    ], copyText('main.pause.3'));
    settings.append($('reader-body'));
    if (!story.saveAvailable) { const p = document.createElement('p'); p.textContent = copyText('main.pause.4'); $('reader-body').append(p); }
}
$('reader-close').addEventListener('click', close);
reader.addEventListener('close',()=>{ if(!reader.open) document.body.append(noticeHost); });
let blankPress=false;
function blankReader(e) {
    return [reader,$('reader-body'),$('reader-actions')].includes(e.target);
}
reader.addEventListener('pointerdown',e=>{blankPress=e.button===0 && blankReader(e);});
reader.addEventListener('click',e=>{if(blankPress && blankReader(e)) close();blankPress=false;});
reader.addEventListener('cancel', event => { event.preventDefault(); close(); });
function enterWorld() {
    mode = 'game'; $('hud').hidden = false;
    scene.controls.clear(); story.visitPosition(scene.playerSnapshot()); updateStatus();
    resumeWorld();
}
function leaveDrive() {
    if (mode !== 'drive') return;
    stopDrive?.(); audio.stopEngine(); scene.showingFilm = false; $('drive').hidden = true;
    if (replayOnly) {
        replayOnly = false; mode = 'title'; $('title-screen').hidden = false; audio.pause(); $('replay-drive').focus(); return;
    }
    scene.controls.teleport(scene.map.roadStart);
    // Commit the checkpoint and the roadside pose together, including when the player skips.
    story.state.position = scene.playerSnapshot();
    enterWorld(); story.advanceArrival('intro','letter');
    restoreMouse = !!window.matchMedia?.('(pointer:fine)').matches;
    open(copyText('main.leavedrive'), inputGuide, [[copyText('main.leavedrive.2'), close]], copyText('main.leavedrive.3'));
}
$('skip-well').addEventListener('click',()=>scene.watch.release());
$('skip-drive').addEventListener('click', leaveDrive);
function startDrive() {
    $('title-screen').hidden = true; audio.start();
    mode = 'drive'; scene.showingFilm = true; audio.update(scene.map.roadStart,true); $('drive').hidden = false; $('skip-drive').focus();
    stopDrive = playDrive(scene, $('drive-film'), $('drive-glass'), $('drive-caption'), leaveDrive, {
        start:()=>audio.startEngine(), wiper:()=>audio.noiseBurst(.19,.052,920,'bandpass'),
        cut:()=>audio.silenceRadio(), brake:()=>audio.brake(),
        impact:()=>{audio.stopEngine();audio.knock();audio.noiseBurst(.30,.43,410);audio.tone(53,.6,.65);}
    });
}
$('replay-drive').addEventListener('click', () => {replayOnly = true; startDrive();});
$('begin').addEventListener('click', () => {
    if (story.state.arrival === 'intro') { startDrive(); return; }
    $('title-screen').hidden = true; audio.start();
    restoreMouse = !!window.matchMedia?.('(pointer:fine)').matches;
    enterWorld();
});
$('restart').addEventListener('click', () => {
    open(copyText('main.text'), copyText('main.text.2'), [[copyText('main.text.3'), close], [copyText('main.text.4'), () => {
        story.reset(); if(scene.watch){scene.watch.phase='quiet';scene.watch.root.visible=false;} scene.controls.teleport(scene.map.playerStart); audio.resetPosition();
        scene.syncState(true); evidenceJournal.sync(); close(); updateStatus();
    }]], copyText('main.text.5'));
});
$('backpack').addEventListener('click',backpack);
$('hints').addEventListener('click',()=>guidance());
$('journal').addEventListener('click', () => journal(!!scene.inspectionReturn));
$('map').addEventListener('click', () => showMap());
$('pause').addEventListener('click', pause);
$('title-settings').addEventListener('click', titleSettings);
$('shield-flame').addEventListener('click', () => {
    if (isPaused() || story.state.lamp !== 'lit') return;
    story.state.shielded = !story.state.shielded; save();
});
$('lock-hang').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'lock' || !story.hangLamp()) return;
    audio.latch(); leaveInspection(); save();
});
$('prompt').addEventListener('click', () => scene.interaction.activate());
document.querySelectorAll('[data-wheel]').forEach(button => button.addEventListener('click', () => rotateLock(Number(button.dataset.wheel))));
$('lock-leave').addEventListener('click', () => leaveInspection());
$('lock-records').addEventListener('click', () => journal(true));
$('lock-hint').addEventListener('click', () => guidance(0, true));
$('lock-attempt').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'lock') return;
    scene.syncState(true);
    if (!story.unlock()) { audio.knock(); updateLock(copyText('main.text.6')); return; }
    scene.syncState(); audio.latch(); leaveInspection();
    $('toast').textContent = copyText('main.text.7'); $('toast').hidden = false;
    setTimeout(() => { $('toast').hidden = true; }, 5000);
});
document.querySelectorAll('[data-bucket]').forEach(button => button.addEventListener('click', () => waterAction(`bucket${button.dataset.bucket}`)));
for (const action of ['fill', 'empty', 'pour', 'weigh']) $(`water-${action}`).addEventListener('click', () => waterAction(action));
$('water-leave').addEventListener('click', () => leaveInspection());
$('water-records').addEventListener('click', () => journal(true));
$('water-hint').addEventListener('click', () => guidance(0, true));
$('portrait-leave').addEventListener('click', () => leaveInspection());
$('portrait-records').addEventListener('click', () => journal(true));
$('portrait-reveal').addEventListener('click', () => {
    if (scene.inspectionKind !== 'portrait' || reader.open || !story.revealPortrait()) return;
    audio.paper(); scene.syncState(); updatePortrait(copyText('main.text.8'));
});
$('portrait-flip').addEventListener('click', () => {
    if (scene.inspectionKind !== 'portrait' || reader.open) return;
    scene.portrait.flip(); audio.paper(); updatePortrait();
});
$('portrait-read').addEventListener('click', () => {
    if (scene.inspectionKind !== 'portrait' || reader.open || !scene.portrait.backVisible || !story.readPortraitBack()) return;
    audio.paper(); readRecord(game.PORTRAIT_BACK_RECORD, [[copyText('main.inspectionlabel.portrait'), portrait]]);
});
document.querySelectorAll('[data-phone-page]').forEach(button => button.addEventListener('click', () => phonePage(button.dataset.phonePage)));
$('phone-leave').addEventListener('click', () => leaveInspection());
$('phone-records').addEventListener('click', () => journal(true));
$('phone-read').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'phone' || !story.readPhonePage(scene.phone.page)) return;
    audio.paper(); save(); updatePhone(); $('phone-reading').querySelector('details').open = true;
});
$('document-leave').addEventListener('click', () => leaveInspection());
$('document-records').addEventListener('click', () => journal(true));
function joinDraft(){
    if(reader.open || scene.inspectionKind!=='document' || scene.documents.activeId!=='school_draft' || story.state.formJoined) return;
    story.state.formJoined=true;scene.documents.syncTear();audio.paper();save();updateDocument();
    ($('document-read').disabled ? $('document-flip') : $('document-read')).focus();
}
$('document-join').addEventListener('click',joinDraft);
$('document-flip').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'document') return;
    scene.documents.flip(); audio.paper(); updateDocument();
});
$('document-read').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'document') return;
    const id = scene.documents.activeId, face = scene.documents.visibleFace;
    if (!face || !story.readDocumentFace(id, face)) return;
    audio.paper(); save(); updateDocument(); $('document-reading').querySelector('details').open = true;
});
evidenceJournal.mountInspector($('lock-inspector'));
evidenceJournal.mountInspector($('water-inspector'));
window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.repeat) return;
    if(scene?.watch?.phase==='film'){
        if(event.code==='Escape'){event.preventDefault();scene.watch.release();}
        return;
    }
    if (mode === 'drive' && event.code === 'Escape') { event.preventDefault(); leaveDrive(); return; }
    if (mode !== 'game') return;
    if (event.code === 'KeyE' && (reader.open || scene.inspectionReturn) && !/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName)) {
        event.preventDefault(); reader.open ? close() : leaveInspection(); return;
    }
    if ((event.code==='KeyB' || event.code==='KeyH') && !/INPUT|SELECT|TEXTAREA/.test(event.target?.tagName)) {
        event.preventDefault();
        if(event.code==='KeyB') reader.open && $('reader-title').textContent===copyText('main.backpack.5') ? close() : backpack();
        else guidance(); return;
    }
    if (reader.open) return;
    if (scene.inspectionKind === 'phone' && /^(Digit|Numpad)[12]$/.test(event.code)) {
        event.preventDefault(); phonePage(Number(event.code.slice(-1)) === 1 ? 'calls' : 'recording');
    } else if (scene.inspectionKind === 'water' && /^(Digit|Numpad)[12]$/.test(event.code)) {
        event.preventDefault(); waterAction(`bucket${Number(event.code.slice(-1)) - 1}`);
    } else if (scene.inspectionKind === 'water' && ['KeyF', 'KeyX', 'KeyP'].includes(event.code)) {
        event.preventDefault(); waterAction({ KeyF: 'fill', KeyX: 'empty', KeyP: 'pour' }[event.code]);
    } else if (scene.inspectionKind === 'lock' && /^(Digit|Numpad)[123]$/.test(event.code)) {
        event.preventDefault(); rotateLock(Number(event.code.slice(-1)) - 1);
    }
    if (event.code === 'KeyJ') { event.preventDefault(); journal(!!scene.inspectionReturn); }
    if (event.code === 'KeyM') { event.preventDefault(); showMap(); }
    if (event.code === 'KeyF' && !scene.inspectionReturn && story.state.lamp === 'lit') { event.preventDefault(); $('shield-flame').click(); }
    if (event.code === 'Escape') { event.preventDefault(); scene.inspectionReturn ? leaveInspection() : pause(); }
});
const touches = new Map();
function updateTouch() {
    let x = 0, y = 0; touches.forEach(move => { x += move[0]; y += move[1]; });
    if (scene?.controls) scene.controls.touchMove = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
}
document.querySelectorAll('[data-move]').forEach(button => {
    button.addEventListener('pointerdown', event => {
        if (isPaused()) return;
        event.preventDefault(); button.setPointerCapture(event.pointerId);
        if (button.dataset.move === '0,1') scene.controls.tapForward(event.timeStamp);
        touches.set(event.pointerId, button.dataset.move.split(',').map(Number)); updateTouch();
    });
    const release = event => { if (button.dataset.move === '0,1') scene.controls.sprinting = false; touches.delete(event.pointerId); updateTouch(); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
});
$('touch-jump').addEventListener('click', () => scene.controls.jump());
window.addEventListener('blur', () => { touches.clear(); updateTouch(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { touches.clear(); updateTouch(); save(); audio.pause(); } else if (mode === 'game' || mode === 'drive') audio.start(); });
window.addEventListener('pagehide', event => {
    save();
    if (event.persisted) { audio.pause(); return; }
    clearInterval(saveTimer); audio.dispose(); scene?.dispose();
});
window.addEventListener('pageshow', event => { if (event.persisted && mode === 'game') audio.start(); });
try {
    scene = new game.ThreeHouseScene({ root: $('world'), prompt: $('prompt'), focusMarker: $('focus-marker'), story, isPaused, onInspect: inspect,
        getPreferences: () => preferences.values,
        isReading: () => reader.open || document.hidden || mode !== 'game',
        onMechanismEvent: event => { if (event === 'door-release') audio.knock(); },
        onWellKnock:(volume,pan)=>{
            if(volume>0 && !audio.sample('impactWood_light_000',volume,pan))audio.tone(184,.11,volume*.21);
        },
        onKitchenDrip: (volume,pan) => {
            if (!audio.sample('impactMetal_light_001',volume,pan)) audio.tone(1030,.13,volume*.23);
        },
        onWatchEvent: (kind, pan) => {
            const panel = $('yard-watch');
            if(kind==='film'){
                releaseMouse();$('well-film').hidden=false;$('skip-well').focus();audio.water('pour');return;
            }
            if(kind==='crease'){audio.paper();return;}
            if(kind==='land'){audio.knock();return;}
            if(kind==='step'){if(!audio.sample('impactWood_light_000',.58,pan))audio.watchStep(pan,true);return;}
            if(kind==='run'){
                $('well-film').hidden=true;restoreMouse=!!window.matchMedia?.('(pointer:fine)').matches;resumeWorld();
            }
            const words={run:copyText('main.words.run'),caught:copyText('main.words.caught'),safe:copyText(story.state.bucketParked?'well.seat.safeQuiet':'main.words.safe')};
            panel.hidden=false;panel.textContent=words[kind];panel.dataset.cue=kind;
            if(kind==='caught')audio.knock();
            if(kind==='safe'||kind==='caught')audio.resetPosition();
            const message=panel.textContent;
            setTimeout(()=>{if(panel.textContent===message)panel.hidden=true;},4200);
        },
        onScaleEvent: event => {
            if (event.phase === 'ready') {
                updateWater();
                const active = document.activeElement;
                if (scene.inspectionKind === 'water' && !reader.open && [document.body, scene.renderer.domElement, $('water-weigh')].includes(active)) {
                    (story.state.waterSolved ? $('water-leave') : $('water-weigh')).focus({ preventScroll: true });
                }
                return;
            }
            event.success ? audio.release() : audio.knock();
            updateWater(event.success ? copyText('main.onscaleevent')
                : copyText('main.onscaleevent.2', event.amount < 4 ? copyText('main.onscaleevent.3') : copyText('main.onscaleevent.4'), event.amount));
        },
        onAssetError: name => { assetErrors.add(name); updateLoadStatus(); },
        onFrame: (position, paused) => {
            if(mode==='game'){
                const phase=scene.watch?.phase;
                const music=phase==='film'?null:phase==='chase'?'chase':story.state.memory?'memory':position.z>4.5?'road':'home';
                audio.setScore(music);
            }
            audio.update(position, paused, story.state.memory || 'house');
            if (!paused) {
                story.visitPosition(position);
                const headline=scene.watch?.phase==='chase'?copyText('main.headline.onframe'):story.headline(position);
                if($('objective').textContent!==headline) $('objective').textContent=headline;
            }
            if (!paused && story.state.lamp === 'lit' && story.inDraft(position) && !story.state.shielded) {
                story.crossDraft(scene.playerSnapshot()); updateStatus();
            }
            if (scene.inspectionKind === 'portrait' && !reader.open) updatePortrait();
            if (scene.inspectionKind === 'document' && !reader.open) updateDocument();
            if (!paused && !story.state.memory && story.state.opened && position.z < -15.2 && story.enterCourtyard())updateStatus();
        } });
    await scene.start();
    scene.controls.onTap = point => scene.interaction.activate(point, scene.renderer.domElement);
    applyPreferences();
    let wheelPress;
    scene.renderer.domElement.addEventListener('pointerdown', event => {
        if (wheelPress && wheelPress.id !== event.pointerId) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        wheelPress = scene.inspectionReturn && !reader.open ? { x: event.clientX, y: event.clientY, originX:event.clientX, originY:event.clientY, dragged:false, id: event.pointerId } : null;
        if (wheelPress && ['portrait', 'document'].includes(scene.inspectionKind)) {
            wheelPress.tear=scene.inspectionKind==='document' && scene.documents.grabTear(event.clientX,event.clientY);
            try { scene.renderer.domElement.setPointerCapture?.(event.pointerId); } catch (_) { /* release is also handled on the canvas */ }
        }
    });
    scene.renderer.domElement.addEventListener('pointermove', event => {
        if (!['portrait', 'document'].includes(scene.inspectionKind) || reader.open || wheelPress?.id !== event.pointerId) return;
        if (event.pointerType === 'mouse' && event.buttons === 0) { if(wheelPress.tear) scene.documents.releaseTear();wheelPress = null; return; }
        wheelPress.dragged ||= Math.hypot(event.clientX-wheelPress.originX,event.clientY-wheelPress.originY)>6;
        if(wheelPress.tear){scene.documents.slideTear(event.clientX,event.clientY);return;}
        (scene.inspectionKind === 'portrait' ? scene.portrait : scene.documents).drag(event.clientX - wheelPress.x, event.clientY - wheelPress.y);
        wheelPress.x = event.clientX; wheelPress.y = event.clientY; scene.inspectionKind === 'portrait' ? updatePortrait() : updateDocument();
    });
    scene.renderer.domElement.addEventListener('pointerup', event => {
        const press = wheelPress;if(press?.id!==event.pointerId) return;wheelPress = null;
        if(press.tear){
            scene.documents.slideTear(event.clientX,event.clientY);
            if(scene.documents.releaseTear() && !reader.open) joinDraft();
            return;
        }
        if (!press || press.dragged || press.id !== event.pointerId || Math.hypot(event.clientX - press.originX, event.clientY - press.originY) > 8) return;
        const kind=scene.inspectionKind;
        if(kind==='wellSeat'){leaveInspection();return;}
        if (['portrait','document','phone'].includes(kind)) {
            const object=kind==='portrait' ? scene.portrait.root : kind==='phone' ? scene.phone.root : scene.documents.papers.get(scene.documents.activeId)?.root;
            const rect=scene.renderer.domElement.getBoundingClientRect();
            if(rect.width && rect.height && object){
                const ray=new THREE.Raycaster();
                ray.setFromCamera(new THREE.Vector2(2*(event.clientX-rect.left)/rect.width-1,1-2*(event.clientY-rect.top)/rect.height),scene.camera);
                if(!ray.intersectObject(object,true).length) {leaveInspection();return;}
            }
            if(kind!=='phone') return;
        }
        if (scene.inspectionKind === 'phone') {
            const page = scene.phone.pick(event.clientX, event.clientY); if (page) phonePage(page);
        } else if (scene.inspectionKind === 'water') {
            const action = scene.courtyard.pick(event.clientX, event.clientY); if (action) waterAction(action); else leaveInspection();
        } else {
            const index = scene.pickWheel(event.clientX, event.clientY);
            if (Number.isInteger(index)) rotateLock(index); else leaveInspection();
        }
    });
    const cancelPress=event=>{
        if(wheelPress?.id!==event.pointerId) return;
        if(wheelPress.tear) scene.documents.releaseTear();
        wheelPress=null;
    };
    scene.renderer.domElement.addEventListener('pointercancel',cancelPress);
    scene.renderer.domElement.addEventListener('lostpointercapture',cancelPress);
    updateStatus(); $('begin').disabled = false; $('title-settings').disabled = false;
    updateLoadStatus();
    saveTimer = setInterval(() => { if (mode === 'game' && !reader.open) save(); }, 5000);
} catch (error) {
    scene?.dispose();
    $('load-status').textContent = copyText('main.text.9', error.message ? `（${error.message}）` : '');
    $('load-status').classList.add('fatal'); $('begin').textContent = copyText('main.text.10');
}
